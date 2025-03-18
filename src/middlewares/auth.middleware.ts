import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, NextFunction } from 'express';
import { ConfigEnum } from 'src/config/config';
import { UnauthorizedException } from 'src/core/response/error.response';
import { verifyAccessToken } from 'src/core/security/jwt.security';
import {
  UserPayloadJWT,
  UserRequest,
} from 'src/modules/user/interface/user.interface';

const HEADERS = {
  AUTHORIZATION: 'authorization',
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly config: ConfigService) {}
  use(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const authorize = req.headers[HEADERS.AUTHORIZATION] as string;
      if (!authorize)
        throw new UnauthorizedException('Missing authorize information');

      const accessToken = authorize.split(' ')[1];
      if (!accessToken) throw new UnauthorizedException('Missing access token');

      const secretKey = this.config.get(ConfigEnum.SECRET_KEY);
      const decodeUser = verifyAccessToken(accessToken, secretKey);
      if (!decodeUser) throw new UnauthorizedException('Invalid access token');

      req.user = decodeUser as UserPayloadJWT;
      next();
    } catch (error) {
      next(error);
      console.log(`Authentication error middleware: ${error.message}`);
    }
  }
}
