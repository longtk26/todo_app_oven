import {
  ReminderEndTaskConsumer,
  ReminderStartTaskConsumer,
} from './consumers/reminder.consumer';
import { VerifyEmailConsumer } from './consumers/verify.consumer';
import { WorkerQueuesEnum } from './worker.enum';

export const registerWorkerQueues = () => {
  return Object.values(WorkerQueuesEnum).map((queue) => ({
    name: queue,
  }));
};

export const registerConsumerQueues = () => {
  return [ReminderStartTaskConsumer, ReminderEndTaskConsumer, VerifyEmailConsumer];
};
