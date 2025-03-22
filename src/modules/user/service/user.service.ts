import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CreateUserDTO, SignInDTO } from '../dto/user.dto';
import { UserRepository } from '../repository/user.repository';
import {
  comparePassword,
  hashPassword,
} from 'src/core/security/passwd.security';
import { ConfigService } from '@nestjs/config';
import { createAccessAndRefreshToken } from 'src/core/security/jwt.security';
import { ConfigEnum } from 'src/config/config';
import {
  BadRequestException,
  UnauthorizedException,
} from 'src/core/response/error.response';
import { TokenService } from 'src/modules/tokens/service/token.service';
import { WorkerProducer } from 'src/worker/worker.producer';
import { WorkerQueuesEnum } from 'src/worker/worker.enum';
import { link } from 'fs';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
    private readonly tokenService: TokenService,
    private readonly workerProducer: WorkerProducer,
  ) {
    this.logger.setContext(UserService.name);
  }

  async createUser(createUserDto: CreateUserDTO) {
    // Step 1: Check user exist in db
    const userDb = await this.userRepository.getUserByEmail(
      createUserDto.email,
    );

    if (userDb) {
      throw new BadRequestException('USER EXISTED');
    }
    // Step 2: Create hashpasswd and save user to db
    const hashPasswd = await hashPassword(createUserDto.password);
    const newUser = await this.userRepository.createUser({
      ...createUserDto,
      password: hashPasswd,
    });

    // Step 3: Create accToken and refreshToken
    const payloadUser = { userId: newUser.id };
    const { accessToken, refreshToken } = createAccessAndRefreshToken(
      payloadUser,
      this.config.get(ConfigEnum.SECRET_KEY),
    );

    // Step 4: return info
    return {
      id: newUser.id,
      email: newUser.email,
      accessToken,
      refreshToken,
    };
  }

  async signIn(signInDto: SignInDTO) {
    // Step 1: Check user exist in db
    const userDb = await this.userRepository.getUserByEmail(signInDto.email);

    if (!userDb) {
      throw new BadRequestException('USER IS NOT EXISTED');
    }
    // Step 2: Compare hashPassword
    const isPasswd = await comparePassword(signInDto.password, userDb.password);
    if (!isPasswd) {
      throw new UnauthorizedException('Credentials are invalid');
    }

    // Step 3: Create accToken and refreshToken
    const payloadUser = { userId: userDb.id };
    const { accessToken, refreshToken } = createAccessAndRefreshToken(
      payloadUser,
      this.config.get(ConfigEnum.SECRET_KEY),
    );

    // Step 4: return info
    return {
      id: userDb.id,
      email: userDb.email,
      accessToken,
      refreshToken,
    };
  }

  async verifyUser(userId: string) {
    // Step 1: Check user exist in db
    const userDb = await this.userRepository.getUserById(userId);
    if (!userDb) {
      throw new BadRequestException('USER IS NOT EXISTED');
    }

    // Step 2: Create a token
    const token = await this.tokenService.createToken(userId);

    // Step 3: Send email to worker
    await this.workerProducer.produceJob(
      WorkerQueuesEnum.SEND_EMAIL_VERIFICATION_QUEUE,
      {
        email: userDb.email,
        link: `${this.config.get(ConfigEnum.CLIENT_URL)}/user/verify-email?token=${token}`,
      },
      0, // Not delay
    );

    return {
      id: userDb.id,
      email: userDb.email,
    };
  }
  

  async verifyUserEmail(token: string) {
    // Step 1: Verify token
    const info = await this.tokenService.verifyToken(token);
    if (!info) {
      throw new InternalServerErrorException('VERIFY TOKEN FAILED');
    }
    const userId = info.userId;

    // Step 2: Update user
    const data = await this.userRepository.updateUser(userId, {
      isVerified: true,
    });
    
    return {
      id: data.id,
      email: data.email,
      isVerified: data.isVerified,
    };
  }

  async getUserById(userId: string) {
    return await this.userRepository.getUserById(userId);
  }
}
