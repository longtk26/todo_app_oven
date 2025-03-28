import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TaskPriority, TaskStatus } from '../enums/task.enum';
import { SuccessResponse } from 'src/core/response/success.response';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDTO {
  @IsNotEmpty({ message: "Please enter task's title" })
  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description: string;

  @ApiProperty({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty()
  @IsNotEmpty({ message: 'Please choose the start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate: string;
}

export class UpdateTaskDTO {
  @IsOptional()
  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TaskPriority, required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  status?: TaskStatus;
}

export class TaskResponseDataDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty({ required: false })
  description?: string;
  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  dueDate: Date;
  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}

export class EditTaskResponseDataDTO {
  @ApiProperty()
  id: string;
}

export class EditTaskResponseDTO extends SuccessResponse<EditTaskResponseDataDTO> {
  @ApiProperty({ type: () => EditTaskResponseDataDTO })
  protected data: EditTaskResponseDataDTO;
}

export class CreateTaskResponseDTO extends SuccessResponse<TaskResponseDataDTO> {
  @ApiProperty({ type: () => TaskResponseDataDTO })
  protected data: TaskResponseDataDTO;
}

export class GetTaskResponseDTO extends SuccessResponse<TaskResponseDataDTO[]> {
  @ApiProperty({ type: () => [TaskResponseDataDTO] })
  protected data: TaskResponseDataDTO[];
}
