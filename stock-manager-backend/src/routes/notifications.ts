import {Router} from 'express';
import {enqueueNotification} from '../worker/producer';
import {requireAuth} from '../middlewares/auth';

const router = Router();

router.post('/test', requireAuth, async (req, res) => {
  const {to, subject, body, type = 'email'} = req.body;
  if (!to || !subject || !body) return res.status(400).json({error: 'to, subject, and body required'});
  await enqueueNotification({type, to, subject, body});
  res.json({queued: true});
});

export default router;
