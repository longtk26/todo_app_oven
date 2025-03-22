import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { TokenRepository } from '../repository/token.repository';
import * as crypto from 'crypto';
import { BadRequestException } from 'src/core/response/error.response';

@Injectable()
export class TokenService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly tokenRepository: TokenRepository,
  ) {
    this.logger.setContext(TokenService.name);
  }

  async createToken(userId: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenInfo = await this.tokenRepository.createToken(userId, token);
    if (!tokenInfo) {
      throw new InternalServerErrorException('CREATE TOKEN FAILED');
    }

    return tokenInfo.token;
  }

  async verifyToken(token: string) {
    const tokenInfo = await this.tokenRepository.getToken(token);
    if (!tokenInfo) {
      throw new BadRequestException('TOKEN NOT FOUND');
    }

    const data = await this.tokenRepository.deleteToken(token);
    if (!data) {
      throw new InternalServerErrorException('DELETE TOKEN FAILED');
    }

    return data;
  }
}
