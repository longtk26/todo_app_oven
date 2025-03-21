import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { SuccessResponse } from 'src/core/response/success.response';
import { Response } from 'express';
import {
  CreateTaskDTO,
  CreateTaskResponseDTO,
  EditTaskResponseDataDTO,
  EditTaskResponseDTO,
  GetTaskResponseDTO,
  UpdateTaskDTO,
} from '../dto/task.dto';
import { TaskService } from '../service/task.service';
import { UserRequest } from 'src/modules/user/interface/user.interface';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tasks created successfully',
    type: CreateTaskResponseDTO,
  })
  @ApiBearerAuth()
  async createTask(
    @Res() res: Response,
    @Body() createTaskDto: CreateTaskDTO,
    @Req() userReq: UserRequest,
  ) {
    const userId = userReq.user.userId;
    const data = await this.taskService.createTask(createTaskDto, userId);

    return new SuccessResponse({
      status: HttpStatus.CREATED,
      message: 'Tasks created',
      data: data,
    }).send(res);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks found',
    type: GetTaskResponseDTO,
  })
  @ApiBearerAuth()
  async getTasks(@Res() res: Response, @Req() userReq: UserRequest) {
    const data = await this.taskService.getTasks(userReq.user.userId);

    return new SuccessResponse({
      status: HttpStatus.OK,
      message: 'Tasks found',
      data: data,
    }).send(res);
  }

  @Patch(':taskId')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks updated successfully',
    type: EditTaskResponseDTO,
  })
  @ApiBearerAuth()
  async updateTask(
    @Res() res: Response,
    @Req() userReq: UserRequest,
    @Body() updateTaskDto: UpdateTaskDTO,
    @Param('taskId') taskId: string,
  ) {
    const data = await this.taskService.updateTask(
      updateTaskDto,
      taskId,
      userReq.user.userId,
    );

    return new SuccessResponse<EditTaskResponseDataDTO>({
      status: HttpStatus.OK,
      message: 'Tasks updated',
      data: { id: data.id },
    }).send(res);
  }

  @Delete(':taskId')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks deleted successfully',
    type: EditTaskResponseDTO,
  })
  @ApiBearerAuth()
  async deleteTask(
    @Res() res: Response,
    @Req() userReq: UserRequest,
    @Param('taskId') taskId: string,
  ) {
    const data = await this.taskService.deleteTask(taskId, userReq.user.userId);

    return new SuccessResponse<EditTaskResponseDataDTO>({
      status: HttpStatus.OK,
      message: 'Tasks deleted',
      data: { id: data.id },
    }).send(res);
  }
}
