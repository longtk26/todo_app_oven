import { WorkerHost, Processor } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PinoLogger } from "nestjs-pino";
import { WorkerQueuesEnum } from "src/worker/worker.queues";

@Processor(WorkerQueuesEnum.EMAIL_QUEUE)
export class EmailConsumer extends WorkerHost {
    constructor(
        private readonly logger: PinoLogger,
    ) {
        super();
        this.logger.setContext(EmailConsumer.name);
    }

    async process(job: Job): Promise<any> {
        this.logger.info(`===EmailConsumer===`);
        this.logger.info(job.data);
        return job.data;
    }
}