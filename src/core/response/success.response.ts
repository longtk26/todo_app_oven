import { Response } from 'express';
import { ResponseHTTP } from './interface';
import { HttpStatus } from '@nestjs/common';

export class SuccessResponse<T> {
  public status: number;
  public message: string;
  public data: T;
  public headers: any;

  constructor(public responseHTTP: ResponseHTTP<T>) {
    this.status = responseHTTP.status || HttpStatus.OK;
    this.message = responseHTTP.message || 'Request success';
    this.data = responseHTTP.data;
    this.headers = responseHTTP.headers;
  }

  public send(res: Response) {
    return res.status(this.status).set(this.headers).send({
      status: this.status,
      message: this.message,
      data: this.data,
    });
  }
}
