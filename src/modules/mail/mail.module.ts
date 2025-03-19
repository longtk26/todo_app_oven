import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';

@Module({
  imports: [],
  providers: [MailService],
})
export class MailModule {}
