import { HttpException, HttpStatus } from '@nestjs/common';

class ErrorException extends HttpException {
  statusCode: number;
  message: string;
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.statusCode = statusCode;
  }
}

class BadRequestException extends ErrorException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

class UnauthorizedException extends ErrorException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

class ForbiddenException extends ErrorException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export {
  ErrorException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
};
