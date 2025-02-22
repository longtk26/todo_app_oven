export enum WorkerQueuesEnum {
  EMAIL_QUEUE = 'email_queue',
  SMS_QUEUE = 'sms_queue',
  PUSH_QUEUE = 'push_queue',
  NOTIFICATION_QUEUE = 'notification_queue',
}

export const registerWorkerQueues = () => {
  return Object.values(WorkerQueuesEnum).map((queue) => ({
    name: queue,
  }));
};
