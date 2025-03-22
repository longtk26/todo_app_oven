import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { SuccessResponse } from 'src/core/response/success.response';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import {
  AuthUserResponseDataDTO,
  AuthUserResponseDTO,
  CreateUserDTO,
  SignInDTO,
  VerifyEmailUserResponseDataDTO,
  VerifyEmailUserResponseDTO,
  VerifyUserResponseDataDTO,
  VerifyUserResponseDTO,
} from '../dto/user.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserRequest } from '../interface/user.interface';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserController.name);
  }

  @Post('sign-up')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: AuthUserResponseDTO,
  })
  async signUp(@Res() res: Response, @Body() createUserDto: CreateUserDTO) {
    const data = await this.userService.createUser(createUserDto);

    return new SuccessResponse<AuthUserResponseDataDTO>({
      status: HttpStatus.CREATED,
      message: 'User created',
      data: data,
    }).send(res);
  }

  @Post('sign-in')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User login successfully',
    type: AuthUserResponseDTO,
  })
  async signIn(@Res() res: Response, @Body() signInDto: SignInDTO) {
    const data = await this.userService.signIn(signInDto);

    return new SuccessResponse<AuthUserResponseDataDTO>({
      status: HttpStatus.OK,
      message: 'User login',
      data: data,
    }).send(res);
  }

  @Post('verify')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API to sent verify email',
    type: VerifyUserResponseDTO,
  })
  @ApiBearerAuth()
  async verify(@Res() res: Response, @Req() req: UserRequest) {
    const data = await this.userService.verifyUser(req.user.userId);

    return new SuccessResponse<VerifyUserResponseDataDTO>({
      status: HttpStatus.OK,
      message: 'Email verified has been sent',
      data: data,
    }).send(res);
  }

  @Get('verify-email')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API to verify email',
    type: VerifyEmailUserResponseDTO,
  })
  async verifyEmail(@Res() res: Response, @Query('token') token: string) {
    const data = await this.userService.verifyUserEmail(token);

    return new SuccessResponse<VerifyEmailUserResponseDataDTO>({
      status: HttpStatus.OK,
      message: 'Email verified',
      data: data,
    }).send(res);
  }
}
