import {
  ReminderEndTaskConsumer,
  ReminderStartTaskConsumer,
} from './consumers/reminder.consumer';

export enum WorkerQueuesEnum {
  REMIND_TASK_START_QUEUE = 'remind_task_start_queue',
  REMIND_TASK_END_QUEUE = 'remind_task_end_queue',
}

export const registerWorkerQueues = () => {
  return Object.values(WorkerQueuesEnum).map((queue) => ({
    name: queue,
  }));
};

export const registerConsumerQueues = () => {
  return [ReminderStartTaskConsumer, ReminderEndTaskConsumer];
};
