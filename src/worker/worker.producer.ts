import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { WorkerQueuesEnum } from "./worker.queues";
import { Queue } from "bullmq";

@Injectable()
export class WorkerProducer {
    private listQueues: Record<string, Queue>;
    constructor(
        @InjectQueue(WorkerQueuesEnum.EMAIL_QUEUE) private emailQueueService: Queue,
        @InjectQueue(WorkerQueuesEnum.SMS_QUEUE) private smsQueueService: Queue,
        @InjectQueue(WorkerQueuesEnum.PUSH_QUEUE) private pushQueueService: Queue,
        @InjectQueue(WorkerQueuesEnum.NOTIFICATION_QUEUE) private notificationQueueService: Queue,
    ) {
        this.registerQueues();
    }

    async produceJob<T>(queue: string, data: T) {
        try {
            // Get queue service
            const queueService: Queue = this.listQueues[queue];
    
            // Add job to queue
            await queueService.add(queue, data);
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    private registerQueues() {
        this.listQueues = {
            [WorkerQueuesEnum.EMAIL_QUEUE]: this.emailQueueService,
            [WorkerQueuesEnum.SMS_QUEUE]: this.smsQueueService,
            [WorkerQueuesEnum.PUSH_QUEUE]: this.pushQueueService,
            [WorkerQueuesEnum.NOTIFICATION_QUEUE]: this.notificationQueueService,
        }
    }
}