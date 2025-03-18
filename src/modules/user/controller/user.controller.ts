import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { SuccessResponse } from 'src/core/response/success.response';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { CreateUserDTO, SignInDTO } from '../dto/user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserController.name);
  }

  @Post('sign-up')
  async signUp(@Res() res: Response, @Body() createUserDto: CreateUserDTO) {
    const data = await this.userService.createUser(createUserDto);

    return new SuccessResponse({
      status: HttpStatus.CREATED,
      message: 'User created',
      data: data,
    }).send(res);
  }

  @Post('sign-in')
  async signIn(@Res() res: Response, @Body() signInDto: SignInDTO) {
    const data = await this.userService.signIn(signInDto);

    return new SuccessResponse({
      status: HttpStatus.CREATED,
      message: 'User login',
      data: data,
    }).send(res);
  }
}
