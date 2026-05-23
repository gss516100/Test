import {Queue} from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const queue = new Queue('notifications', {connection});

export async function enqueueNotification(payload: {type: string; to: string; subject: string; body: string}) {
  await queue.add('send-notification', payload);
}

export async function enqueueEmail(to: string, subject: string, body: string) {
  await enqueueNotification({type: 'email', to, subject, body});
}
