import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { WorkerQueuesEnum } from './worker.enum';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class WorkerProducer {
  private listQueues: Record<string, Queue>;
  constructor(
    @InjectQueue(WorkerQueuesEnum.REMIND_TASK_START_QUEUE)
    private remindTaskStartQueueService: Queue,
    @InjectQueue(WorkerQueuesEnum.REMIND_TASK_END_QUEUE)
    private remindTaskEndQueueService: Queue,
    @InjectQueue(WorkerQueuesEnum.SEND_EMAIL_VERIFICATION_QUEUE)
    private sendEmailVerificationQueueService: Queue,
    private readonly logger: PinoLogger,
  ) {
    this.registerQueues();
  }

  async produceJob<T>(queue: string, data: T, delay?: number) {
    try {
      // Get queue service
      const queueService: Queue = this.listQueues[queue];

      // Add job to queue
      const job = await queueService.add(queue, data, { delay, removeOnComplete: true });

      this.logger.info(`===Job ${job.id} added to queue ${queue}===`);
      return job.id;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async removeJob(queue: string, jobId: string) {
    try {
      // Get queue service
      const queueService: Queue = this.listQueues[queue];

      // Remove job from queue
      await queueService.remove(jobId);
      this.logger.info(`===Job ${jobId} removed from queue ${queue}===`);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  private registerQueues() {
    this.listQueues = {
      [WorkerQueuesEnum.REMIND_TASK_START_QUEUE]:
        this.remindTaskStartQueueService,
      [WorkerQueuesEnum.REMIND_TASK_END_QUEUE]: this.remindTaskEndQueueService,
      [WorkerQueuesEnum.SEND_EMAIL_VERIFICATION_QUEUE]:
        this.sendEmailVerificationQueueService,
    };
  }
}
