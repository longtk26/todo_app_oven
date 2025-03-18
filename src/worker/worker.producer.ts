import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { WorkerQueuesEnum } from './worker.queues';
import { Queue } from 'bullmq';

@Injectable()
export class WorkerProducer {
  private listQueues: Record<string, Queue>;
  constructor(
    @InjectQueue(WorkerQueuesEnum.REMIND_TASK_START_QUEUE)
    private remindTaskStartQueueService: Queue,
    @InjectQueue(WorkerQueuesEnum.REMIND_TASK_END_QUEUE)
    private remindTaskEndQueueService: Queue,
  ) {
    this.registerQueues();
  }

  async produceJob<T>(queue: string, data: T, delay?: number) {
    try {
      // Get queue service
      const queueService: Queue = this.listQueues[queue];

      // Add job to queue
      await queueService.add(queue, data, { delay, removeOnComplete: true });
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  private registerQueues() {
    this.listQueues = {
      [WorkerQueuesEnum.REMIND_TASK_START_QUEUE]:
        this.remindTaskStartQueueService,
      [WorkerQueuesEnum.REMIND_TASK_END_QUEUE]: this.remindTaskEndQueueService,
    };
  }
}
