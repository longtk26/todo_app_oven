import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/core/orm/prisma';
import {
  CreateTaskRepositoryType,
  UpdateTaskRepositoryType,
} from '../types/task.types';

@Injectable()
export class TaskRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TaskRepository.name);
  }

  async createTask(createTaskRepository: CreateTaskRepositoryType) {
    const data = this.prismaService.task.create({
      data: {
        ...createTaskRepository,
      },
    });

    return data;
  }

  async getTasksByUserId(userId: string) {
    const tasks = this.prismaService.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks;
  }

  async updateTask(
    updateTaskRepository: UpdateTaskRepositoryType,
    taskId: string,
  ) {
    const data = this.prismaService.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...updateTaskRepository,
      },
    });

    return data;
  }

  async getTaskById(taskId: string) {
    const task = this.prismaService.task.findUnique({
      where: {
        id: taskId,
      },
    });

    return task;
  }

  async deleteTask(taskId: string) {
    const data = this.prismaService.task.delete({
      where: {
        id: taskId,
      },
    });

    return data;
  }
}
