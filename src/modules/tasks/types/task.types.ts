import { TaskPriority, TaskStatus } from '../enums/task.enum';

export type CreateTaskRepositoryType = {
  title: string;
  description?: string;
  priority: TaskPriority;
  userId: string;
  startDate?: string;
  dueDate?: string;
};

export type UpdateTaskRepositoryType = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
  status?: TaskStatus;
};

export type GetTaskRepositoryType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: Date;
  dueDate?: Date;
  userId: string;
};
