import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TaskPriority, TaskStatus } from '../enums/task.enum';

export class CreateTaskDTO {
  @IsNotEmpty({ message: "Please enter task's title" })
  title: string;

  @IsOptional()
  description: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsNotEmpty({ message: 'Please choose the start date' })
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  dueDate: string;
}

export class UpdateTaskDTO {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  status: TaskStatus;
}
