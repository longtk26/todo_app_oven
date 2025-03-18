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
import { CreateTaskDTO, UpdateTaskDTO } from '../dto/task.dto';
import { TaskService } from '../service/task.service';
import { UserRequest } from 'src/modules/user/interface/user.interface';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
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
  async getTasks(@Res() res: Response, @Req() userReq: UserRequest) {
    const data = await this.taskService.getTasks(userReq.user.userId);

    return new SuccessResponse({
      status: HttpStatus.OK,
      message: 'Tasks found',
      data: data,
    }).send(res);
  }

  @Patch(':taskId')
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

    return new SuccessResponse({
      status: HttpStatus.OK,
      message: 'Tasks updated',
      data: data,
    }).send(res);
  }

  @Delete(':taskId')
  async deleteTask(
    @Res() res: Response,
    @Req() userReq: UserRequest,
    @Param('taskId') taskId: string,
  ) {
    const data = await this.taskService.deleteTask(taskId, userReq.user.userId);

    return new SuccessResponse({
      status: HttpStatus.OK,
      message: 'Tasks deleted',
      data: data,
    }).send(res);
  }
}
