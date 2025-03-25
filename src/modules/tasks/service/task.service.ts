import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateTaskDTO,
  TaskResponseDataDTO,
  UpdateTaskDTO,
} from '../dto/task.dto';
import { UserService } from 'src/modules/user/service/user.service';
import { BadRequestException } from 'src/core/response/error.response';
import { TaskRepository } from '../repository/task.reposiroty';
import { WorkerProducer } from 'src/worker/worker.producer';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from 'src/config/config';
import { RedisClient } from 'src/core/cache/redis';
import { GetTaskRepositoryType } from '../types/task.types';
import { WorkerQueuesEnum } from 'src/worker/worker.enum';
import { TaskStatus } from '../enums/task.enum';
import _ from 'lodash';

@Injectable()
export class TaskService {
  static KEY_STORE_LIST_TASK = 'todo:tasks';
  static KEY_STORE_JOB_TASK = 'todo:job:task';

  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private readonly taskRepository: TaskRepository,
    private readonly workerProducer: WorkerProducer,
    private readonly logger: PinoLogger,
    private readonly redis: RedisClient,
  ) {}
  async createTask(createTaskDto: CreateTaskDTO, userId: string) {
    // Check if the user exists
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new BadRequestException('USER NOT FOUND');
    }

    // Validate start and due date
    await this.validateStartAndDueDate(
      createTaskDto.startDate,
      createTaskDto.dueDate,
    );

    // Create a task
    const newTask = await this.taskRepository.createTask({
      ...createTaskDto,
      startDate:
        createTaskDto.startDate &&
        new Date(createTaskDto.startDate).toISOString(),
      dueDate:
        createTaskDto.dueDate && new Date(createTaskDto.dueDate).toISOString(),
      userId,
    });

    if (!newTask) {
      throw new InternalServerErrorException('CREATE TASK FAILED');
    }

    // Remind the user to do the task
    this.sendTaskReminderEmail(newTask.id, userId);

    // Clear task list cache
    await this.deleteTaskListCache(userId);

    return _.omitBy(newTask, _.isNil) as TaskResponseDataDTO;
  }

  async getTasks(userId: string) {
    // Get task list from cache
    const taskList = await this.getTaskListFromCache(userId);
    if (taskList) {
      this.logger.info('===GET TASK LIST FROM CACHE===');
      return taskList;
    }

    const tasks = (await this.taskRepository.getTasksByUserId(
      userId,
    )) as TaskResponseDataDTO[];
    this.logger.info('===GET TASK LIST FROM DATABASE===');

    const results = tasks.map(
      (task) => _.omitBy(task, _.isNil) as TaskResponseDataDTO,
    );
    // Store task list to cache
    await this.setTaskListToCache(userId, results);

    return results;
  }

  async updateTask(
    updateTaskDto: UpdateTaskDTO,
    taskId: string,
    userId: string,
  ) {
    // Check task ownership
    await this.validateTaskOwnership(taskId, userId);

    // Validate start and due date
    await this.validateStartAndDueDate(
      updateTaskDto.startDate,
      updateTaskDto.dueDate,
    );

    // Update task
    const updatedTask = await this.taskRepository.updateTask(
      {
        ...updateTaskDto,
        startDate:
          updateTaskDto.startDate &&
          new Date(updateTaskDto.startDate).toISOString(),
        dueDate:
          updateTaskDto.dueDate &&
          new Date(updateTaskDto.dueDate).toISOString(),
      },
      taskId,
    );

    // Remind the user to do the task
    if (updateTaskDto.startDate || updateTaskDto.dueDate) {
      this.sendTaskReminderEmail(taskId, userId);
    }

    // Clear task list cache
    await this.deleteTaskListCache(userId);

    // Check if the task is done
    await this.checkMarkTaskAsDone(updatedTask.id);

    if (!updatedTask) {
      throw new InternalServerErrorException('UPDATE TASK FAILED');
    }

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string) {
    // Check task ownership
    await this.validateTaskOwnership(taskId, userId);

    // Delete task
    const deletedTask = await this.taskRepository.deleteTask(taskId);
    if (!deletedTask) {
      throw new InternalServerErrorException('DELETE TASK FAILED');
    }

    // Clear task list cache
    await this.deleteTaskListCache(userId);

    // Remove job from queue
    await this.deleteJobByTaskId(
      taskId,
      WorkerQueuesEnum.REMIND_TASK_START_QUEUE,
    );
    await this.deleteJobByTaskId(
      taskId,
      WorkerQueuesEnum.REMIND_TASK_END_QUEUE,
    );
    return deletedTask;
  }

  async validateStartAndDueDate(startDate: string, dueDate: string) {
    if (startDate) {
      if (new Date(startDate) < new Date()) {
        throw new BadRequestException('START DATE MUST BE IN THE FUTURE');
      }
    }

    if (startDate && dueDate) {
      if (new Date(startDate) > new Date(dueDate)) {
        throw new BadRequestException('START DATE MUST BE BEFORE DUE DATE');
      }
    }
  }

  async validateTaskOwnership(taskId: string, userId: string) {
    const taskUser = await this.taskRepository.getTaskById(taskId);
    if (taskUser.userId !== userId) {
      throw new BadRequestException('TASK IS NOT YOURS');
    }
    return taskUser;
  }

  async getTaskListFromCache(userId: string) {
    const cachedData = (await this.redis.get(
      `${TaskService.KEY_STORE_LIST_TASK}:${userId}`,
    )) as TaskResponseDataDTO[];
    return cachedData;
  }

  async setTaskListToCache(userId: string, tasks: GetTaskRepositoryType[]) {
    return this.redis.set(
      `${TaskService.KEY_STORE_LIST_TASK}:${userId}`,
      tasks,
      0,
    );
  }

  async getJobIdByTaskId(taskId: string) {
    return (await this.redis.get(
      `${TaskService.KEY_STORE_JOB_TASK}:${taskId}`,
    )) as string;
  }

  async setJobIdByTaskId(taskId: string, jobId: string) {
    return this.redis.set(
      `${TaskService.KEY_STORE_JOB_TASK}:${taskId}`,
      jobId,
      0,
    );
  }

  async deleteTaskListCache(userId: string) {
    return this.redis.del(`${TaskService.KEY_STORE_LIST_TASK}:${userId}`);
  }

  async checkMarkTaskAsDone(taskId: string) {
    const task = await this.taskRepository.getTaskById(taskId);
    const isOverDueDate = task.dueDate && new Date(task.dueDate) < new Date();
    const isOverStartDate =
      task.startDate && new Date(task.startDate) < new Date();
    const isMarkAsDone = task.status === TaskStatus.COMPLETED;

    if (isMarkAsDone && !isOverDueDate) {
      // Remove job from queue
      await this.deleteJobByTaskId(
        taskId,
        WorkerQueuesEnum.REMIND_TASK_END_QUEUE,
      );
    }

    if (isMarkAsDone && !isOverStartDate) {
      // Remove job from queue
      await this.deleteJobByTaskId(
        taskId,
        WorkerQueuesEnum.REMIND_TASK_START_QUEUE,
      );
    }
  }

  async deleteJobByTaskId(taskId: string, queue: WorkerQueuesEnum) {
    const jobId = await this.getJobIdByTaskId(taskId);
    if (jobId) {
      await this.workerProducer.removeJob(queue, jobId);
    }
  }

  async sendTaskReminderEmail(taskId: string, userId: string) {
    const task = await this.taskRepository.getTaskById(taskId);
    const user = await this.userService.getUserById(userId);

    if (!user.isVerified) {
      this.logger.warn('===USER NOT VERIFIED===');
      return;
    }

    const baseData = {
      email: user.email,
      taskName: task.title,
    };

    // Handle task start
    const dataStart = {
      ...baseData,
      startDate: task.startDate,
    };
    const gapTime = new Date(task.startDate).getTime() - new Date().getTime();
    const beforeTime = parseInt(
      this.config.get(ConfigEnum.TIME_NOTIFY_REMINDER),
    );
    if (gapTime > beforeTime) {
      const delayStart = gapTime - beforeTime;
      this.logger.info(`===TIME DELAY START: ${delayStart}===`);
      const jobId = await this.workerProducer.produceJob(
        WorkerQueuesEnum.REMIND_TASK_START_QUEUE,
        dataStart,
        delayStart,
      );
      await this.setJobIdByTaskId(taskId, jobId);
    }

    if (!task.dueDate) {
      return;
    }

    // Handle task end
    const dataEnd = {
      ...baseData,
      dueDate: task.dueDate,
    };

    const gapTimeEnd = new Date(task.dueDate).getTime() - new Date().getTime();
    if (gapTimeEnd > beforeTime) {
      const delayEnd = gapTimeEnd - beforeTime;
      this.logger.info(`===TIME DELAY END: ${delayEnd}===`);
      const jobId = await this.workerProducer.produceJob(
        WorkerQueuesEnum.REMIND_TASK_END_QUEUE,
        dataEnd,
        delayEnd,
      );
      await this.setJobIdByTaskId(taskId, jobId);
    }
  }
}
