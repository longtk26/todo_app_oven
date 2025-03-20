import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { MailService } from 'src/modules/mail/service/mail.service';

@Processor('remind_task_start_queue')
export class ReminderStartTaskConsumer extends WorkerHost {
  constructor(
    private readonly logger: PinoLogger,
    private readonly mailService: MailService,
  ) {
    super();
    this.logger.setContext(ReminderStartTaskConsumer.name);
  }

  async process(job: Job): Promise<any> {
    this.logger.info(`===RemindStart Consumer===`);
    this.logger.info(job.data);
    await this.mailService.sendMail({
      to: job.data.email,
      subject: 'Task Reminder Start',
      content: `Task ${job.data.taskName} is about to start`,
    });
    return job.data;
  }
}

@Processor('remind_task_end_queue')
export class ReminderEndTaskConsumer extends WorkerHost {
  constructor(
    private readonly logger: PinoLogger,
    private readonly mailService: MailService,
  ) {
    super();
    this.logger.setContext(ReminderEndTaskConsumer.name);
  }

  async process(job: Job): Promise<any> {
    this.logger.info(`===RemindEnd Consumer===`);
    this.logger.info(job.data);
    await this.mailService.sendMail({
      to: job.data.email,
      subject: 'Task Reminder End',
      content: `Task ${job.data.taskName} is about to end`,
    });

    return job.data;
  }
}
