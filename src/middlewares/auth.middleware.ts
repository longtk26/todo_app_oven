import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { UnauthorizedException } from 'src/core/response/error.response';
import { SecurityService } from 'src/core/security/security.service';
import {
  UserPayloadJWT,
  UserRequest,
} from 'src/modules/user/interface/user.interface';

const HEADERS = {
  AUTHORIZATION: 'authorization',
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly securityService: SecurityService) {}
  use(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const authorize = req.headers[HEADERS.AUTHORIZATION] as string;
      if (!authorize)
        throw new UnauthorizedException('Missing authorize information');

      const accessToken = authorize.split(' ')[1];
      if (!accessToken) throw new UnauthorizedException('Missing access token');

      const decodeUser = this.securityService.verifyAccessToken(accessToken);
      if (!decodeUser) throw new UnauthorizedException('Invalid access token');

      req.user = decodeUser as UserPayloadJWT;
      next();
    } catch (error) {
      next(error);
      console.log(`Authentication error middleware: ${error.message}`);
    }
  }
}
