import { UserService } from 'src/modules/user/service/user.service';
import { TaskService } from '../service/task.service';
import { TaskRepository } from '../repository/task.reposiroty';
import { WorkerProducer } from 'src/worker/worker.producer';
import { RedisClient } from 'src/core/cache/redis';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskDTO, UpdateTaskDTO } from '../dto/task.dto';
import { TaskPriority, TaskStatus } from '../enums/task.enum';
import { InternalServerErrorException } from '@nestjs/common';
import { BadRequestException } from 'src/core/response/error.response';
import { GetTaskRepositoryType } from '../types/task.types';

describe('TaskService', () => {
  let taskService: TaskService;
  let userService: UserService;
  let taskRepository: TaskRepository;
  let workerProducer: WorkerProducer;
  let redisClient: RedisClient;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: UserService,
          useValue: { getUserById: jest.fn() },
        },
        {
          provide: TaskRepository,
          useValue: {
            createTask: jest.fn(),
            getTaskById: jest.fn(),
            getTasksByUserId: jest.fn(),
            updateTask: jest.fn(),
            deleteTask: jest.fn(),
          },
        },
        {
          provide: WorkerProducer,
          useValue: { produceJob: jest.fn() },
        },
        {
          provide: PinoLogger,
          useValue: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: RedisClient,
          useValue: { del: jest.fn() },
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    userService = module.get<UserService>(UserService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    workerProducer = module.get<WorkerProducer>(WorkerProducer);
    redisClient = module.get<RedisClient>(RedisClient);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const userId = '123';
    const createTaskDto: CreateTaskDTO = {
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.LOW,
      startDate: new Date(Date.now() + 60 * 1000 * 10).toISOString(),
      dueDate: new Date(Date.now() + 60 * 1000 * 11).toISOString(),
    };

    it('should throw BadRequestException if user is not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.createTask(createTaskDto, userId),
      ).rejects.toThrow(new BadRequestException('USER NOT FOUND'));
    });

    it('should create a task successfully', async () => {
      const fixedNow = new Date('2024-03-22T12:00:00Z').getTime(); // Giả lập thời gian hiện tại
      jest.spyOn(Date, 'now').mockImplementation(() => fixedNow);

      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'longtk26@gmail.com',
        isVerified: true,
      };
      const mockTask = {
        id: 'task-1',
        ...createTaskDto,
        userId,
        startDate: new Date(fixedNow + 2 * 60000).toISOString(), // start sau 2 phút
        dueDate: new Date(fixedNow + 5 * 60000).toISOString(), // due sau 5 phút
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (taskRepository.createTask as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.getTaskById as jest.Mock).mockResolvedValue(mockTask);
      (workerProducer.produceJob as jest.Mock).mockImplementation(jest.fn());
      (configService.get as jest.Mock).mockReturnValue(60000);
      (taskService['redis'] as any).get = jest.fn();
      (taskService['redis'] as any).set = jest.fn();
      (redisClient.del as jest.Mock).mockResolvedValue(1);

      const result = await taskService.createTask(createTaskDto, userId);

      expect(result).toEqual(mockTask);
      expect(taskRepository.createTask).toHaveBeenCalledWith({
        ...createTaskDto,
        startDate: expect.any(String),
        dueDate: expect.any(String),
        userId,
      });

      
      expect(workerProducer.produceJob).toHaveBeenCalledWith(
        'remind_task_start_queue',
        {
          email: mockUser.email,
          startDate: mockTask.startDate,
          taskName: mockTask.title,
        },
        60000, 
      );

      expect(workerProducer.produceJob).toHaveBeenCalledWith(
        'remind_task_end_queue',
        {
          email: mockUser.email,
          dueDate: mockTask.dueDate,
          taskName: mockTask.title,
        },
        240000, 
      );

      expect(redisClient.del).toHaveBeenCalledWith(`todo:tasks:${userId}`);
    });

    it('should throw InternalServerErrorException if task creation fails', async () => {
      const mockUser = { id: userId, name: 'John Doe' };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (taskRepository.createTask as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.createTask(createTaskDto, userId),
      ).rejects.toThrow(new InternalServerErrorException('CREATE TASK FAILED'));
    });
  });

  describe('updateTask', () => {
    const userId = '123';
    const createTaskDto: CreateTaskDTO = {
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.LOW,
      startDate: new Date(Date.now() + 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 60 * 1000 * 2).toISOString(),
    };
    const updateTaskDto: UpdateTaskDTO = {
      title: 'Update Task',
      description: 'Update Description',
    };

    it('should update a task successfully', async () => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'longtk26@gmail.com',
      };
      const mockTask = { id: 'task-1', ...createTaskDto, userId };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (taskRepository.createTask as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.getTaskById as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.updateTask as jest.Mock).mockResolvedValue({
        id: mockTask.id,
        ...createTaskDto,
        ...updateTaskDto,
        userId,
      });
      (workerProducer.produceJob as jest.Mock).mockImplementation(jest.fn());
      (redisClient.del as jest.Mock).mockResolvedValue(1);

      const result = await taskService.createTask(createTaskDto, userId);
      const updatedTask = await taskService.updateTask(
        updateTaskDto,
        result.id,
        userId,
      );

      expect(updatedTask.id).toEqual(result.id);
      expect(updatedTask.title).toEqual(updateTaskDto.title);
      expect(updatedTask.description).toEqual(updateTaskDto.description);
      expect(updatedTask.priority).toEqual(createTaskDto.priority);
      expect(updatedTask.startDate).toEqual(createTaskDto.startDate);
      expect(updatedTask.dueDate).toEqual(createTaskDto.dueDate);
      expect(updatedTask.userId).toEqual(userId);
    });
  });

  describe('deleteTask', () => {
    const userId = '123';
    const createTaskDto: CreateTaskDTO = {
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.LOW,
      startDate: new Date(Date.now() + 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 60 * 1000 * 2).toISOString(),
    };

    it('should delete a task successfully', async () => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'longtk26@gmail.com',
      };
      const mockTask = { id: 'task-1', ...createTaskDto, userId };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (taskRepository.createTask as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.getTaskById as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.deleteTask as jest.Mock).mockResolvedValue(mockTask);
      (workerProducer.produceJob as jest.Mock).mockImplementation(jest.fn());
      (redisClient.del as jest.Mock).mockResolvedValue(1);
      (taskService['redis'] as any).get = jest.fn();

      const result = await taskService.createTask(createTaskDto, userId);
      const deletedTask = await taskService.deleteTask(result.id, userId);

      expect(deletedTask.id).toEqual(result.id);
      expect(redisClient.del).toHaveBeenCalledWith(`todo:tasks:${userId}`);
    });
  });

  describe('getTask', () => {
    const userId = '123';
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Test Task 1',
        description: 'Description 1',
        priority: TaskPriority.LOW,
        startDate: new Date(),
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TaskStatus.PENDING,
        userId,
      },
      {
        id: 'task-2',
        title: 'Test Task 2',
        description: 'Description 2',
        priority: TaskPriority.MEDIUM,
        startDate: new Date(),
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TaskStatus.PENDING,
        userId,
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return tasks from cache if available', async () => {
      const getTaskListFromCacheSpy = jest
        .spyOn(taskService, 'getTaskListFromCache')
        .mockResolvedValue(mockTasks);
      const setTaskListToCacheSpy = jest.spyOn(
        taskService,
        'setTaskListToCache',
      );

      const result = await taskService.getTasks(userId);

      expect(result).toEqual(mockTasks);
      expect(getTaskListFromCacheSpy).toHaveBeenCalledWith(userId);
      expect(taskRepository.getTasksByUserId).not.toHaveBeenCalled(); // Không gọi DB nếu có cache
      expect(setTaskListToCacheSpy).not.toHaveBeenCalled(); // Không lưu vào cache nếu đã có sẵn
    });

    it('should return tasks from database if cache is not available', async () => {
      const getTaskListFromCacheSpy = jest
        .spyOn(taskService, 'getTaskListFromCache')
        .mockResolvedValue(null);
      const setTaskListToCacheSpy = jest.spyOn(
        taskService,
        'setTaskListToCache',
      );
      (taskRepository.getTasksByUserId as jest.Mock).mockResolvedValue(
        mockTasks,
      );
      (taskService['redis'] as any).set = jest.fn();

      const result = await taskService.getTasks(userId);

      expect(result).toEqual(mockTasks);
      expect(getTaskListFromCacheSpy).toHaveBeenCalledWith(userId);
      expect(taskRepository.getTasksByUserId).toHaveBeenCalledWith(userId);
      expect(setTaskListToCacheSpy).toHaveBeenCalledWith(userId, mockTasks);
    });
  });
});
