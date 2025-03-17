import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { SuccessResponse } from 'src/core/response/success.response';
import { Response } from 'express';

@Controller('task')
export class UserController {
  constructor() {}

  @Get()
  async getTasks(@Res() res: Response) {
    // const data = await this.userService.getUsers();
    new SuccessResponse({
      status: HttpStatus.OK,
      message: 'Tasks found',
      data: '',
    }).send(res);
  }
}
