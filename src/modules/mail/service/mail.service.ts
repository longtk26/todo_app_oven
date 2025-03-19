import { Injectable } from '@nestjs/common';
import { SendMailPayload } from '../types/mail.types';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailConfig } from 'src/config/interface';
import { ConfigEnum } from 'src/config/config';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = this.initMailService();
  }

  async sendMail(payload: SendMailPayload) {
    await this.transporter.sendMail({
      from: this.config.get<EmailConfig>(ConfigEnum.EMAIL_CONFIG).user,
      to: payload.to,
      subject: payload.subject,
      text: payload.content,
    });
  }

  private initMailService() {
    const emailConfig = this.config.get<EmailConfig>(ConfigEnum.EMAIL_CONFIG);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
  }
}
