import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { UserSerivce } from '../service/user.service';
import { SuccessResponse } from 'src/core/response/success.response';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserSerivce) {}

  @Get()
  getUsers(@Res() res: Response) {
    const data = this.userService.getUsers();
    new SuccessResponse({
      status: HttpStatus.OK,
      message: 'Users found',
      data,
    }).send(res);
  }
}
