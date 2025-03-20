import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTaskDTO, UpdateTaskDTO } from '../dto/task.dto';
import { UserService } from 'src/modules/user/service/user.service';
import { BadRequestException } from 'src/core/response/error.response';
import { TaskRepository } from '../repository/task.reposiroty';
import { WorkerProducer } from 'src/worker/worker.producer';
import { WorkerQueuesEnum } from 'src/worker/worker.queues';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from 'src/config/config';

@Injectable()
export class TaskService {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private readonly taskRepository: TaskRepository,
    private readonly workerProducer: WorkerProducer,
    private readonly logger: PinoLogger,
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

    // Remind the user to do the task
    this.sendTaskReminderEmail(newTask.id, userId);

    if (!newTask) {
      throw new InternalServerErrorException('CREATE TASK FAILED');
    }

    return newTask;
  }

  async getTasks(userId: string) {
    const tasks = await this.taskRepository.getTasksByUserId(userId);
    return tasks;
  }

  async updateTask(
    updateTaskDto: UpdateTaskDTO,
    taskId: string,
    userId: string,
  ) {
    // Check task ownership
    const taskUser = await this.validateTaskOwnership(taskId, userId);

    // Validate start and due date
    await this.validateStartAndDueDate(
      updateTaskDto.startDate || taskUser.startDate.toString(),
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
    this.sendTaskReminderEmail(taskId, userId);

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

    return deletedTask;
  }

  private async validateStartAndDueDate(startDate: string, dueDate: string) {
    if (new Date(startDate) < new Date()) {
      throw new BadRequestException('START DATE MUST BE IN THE FUTURE');
    }

    if (startDate && dueDate) {
      if (new Date(startDate) > new Date(dueDate)) {
        throw new BadRequestException('START DATE MUST BE BEFORE DUE DATE');
      }
    }
  }

  private async validateTaskOwnership(taskId: string, userId: string) {
    const taskUser = await this.taskRepository.getTaskById(taskId);
    if (taskUser.userId !== userId) {
      throw new BadRequestException('TASK IS NOT YOURS');
    }
    return taskUser;
  }

  private async sendTaskReminderEmail(taskId: string, userId: string) {
    const task = await this.taskRepository.getTaskById(taskId);
    const user = await this.userService.getUserById(userId);
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
    let delayStart = 0;
    if (gapTime > beforeTime) {
      delayStart = gapTime - beforeTime;
    }
    this.logger.info(`===TIME DELAY START: ${delayStart}===`);
    this.workerProducer.produceJob(
      WorkerQueuesEnum.REMIND_TASK_START_QUEUE,
      dataStart,
      delayStart,
    );

    if (!task.dueDate) {
      return;
    }

    // Handle task end
    const dataEnd = {
      ...baseData,
      dueDate: task.dueDate,
    };

    const gapTimeEnd = new Date(task.dueDate).getTime() - new Date().getTime();
    let delayEnd = 0;
    if (gapTimeEnd > beforeTime) {
      delayEnd = gapTimeEnd - beforeTime;
    }
    this.logger.info(`===TIME DELAY END: ${delayEnd}===`);
    this.workerProducer.produceJob(
      WorkerQueuesEnum.REMIND_TASK_END_QUEUE,
      dataEnd,
      delayEnd,
    );
  }
}
