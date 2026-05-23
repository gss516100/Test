import {Worker} from 'bullmq';
import IORedis from 'ioredis';
import nodemailer from 'nodemailer';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const worker = new Worker('notifications', async (job) => {
  const {type, to, subject, body} = job.data;
  if (type === 'email') {
    await transporter.sendMail({from: process.env.SMTP_FROM, to, subject, text: body});
  }
  // extend for WhatsApp/SMS/webhooks
}, {connection});

worker.on('completed', (job) => {
  // eslint-disable-next-line no-console
  console.log('Notification job completed', job.id);
});

worker.on('failed', (job, err) => {
  // eslint-disable-next-line no-console
  console.error('Notification job failed', job?.id, err);
});

export default worker;
