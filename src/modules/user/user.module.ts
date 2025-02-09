import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserSerivce } from './service/user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserSerivce],
})
export class UserModule {}
