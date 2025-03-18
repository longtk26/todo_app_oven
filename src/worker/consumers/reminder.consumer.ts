import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';

@Processor('remind_task_start_queue')
export class ReminderStartTaskConsumer extends WorkerHost {
  constructor(private readonly logger: PinoLogger) {
    super();
    this.logger.setContext(ReminderStartTaskConsumer.name);
  }

  async process(job: Job): Promise<any> {
    this.logger.info(`===RemindStart Consumer===`);
    this.logger.info(job.data);
    return job.data;
  }
}

@Processor('remind_task_end_queue')
export class ReminderEndTaskConsumer extends WorkerHost {
  constructor(private readonly logger: PinoLogger) {
    super();
    this.logger.setContext(ReminderEndTaskConsumer.name);
  }

  async process(job: Job): Promise<any> {
    this.logger.info(`===RemindEnd Consumer===`);
    this.logger.info(job.data);
    return job.data;
  }
}
