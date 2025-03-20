import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrokerConfig } from 'src/config/interface';
import { ConfigEnum } from 'src/config/config';
import { registerConsumerQueues, registerWorkerQueues } from './worker.queues';
import { WorkerProducer } from './worker.producer';
import { MailService } from 'src/modules/mail/service/mail.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<BrokerConfig>(ConfigEnum.BROKER_CONFIG).host,
          port: parseInt(
            configService.get<BrokerConfig>(ConfigEnum.BROKER_CONFIG).port,
          ),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(...registerWorkerQueues()),
  ],
  providers: [WorkerProducer, MailService, ...registerConsumerQueues()],
  exports: [WorkerProducer],
})
export class WorkerModule {}
