import {Router} from 'express';
import {AppDataSource} from '../config/data-source';
import {Alert} from '../entities/Alert';
import {enqueueNotification} from '../worker/producer';
import {requireAuth, AuthenticatedRequest} from '../middlewares/auth';

const router = Router();
const repo = () => AppDataSource.getRepository(Alert);

router.get('/', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const items = await repo().find({where: {userId: user?.id}});
  res.json(items);
});

router.post('/', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const {name, targetType, targetRef, rule, channels = ['email']} = req.body;
  if (!name || !targetType || !targetRef) return res.status(400).json({error: 'name, targetType and targetRef required'});
  const alert = repo().create({userId: user?.id, name, targetType, targetRef, rule, channels});
  await repo().save(alert);
  res.status(201).json(alert);
});

router.put('/:id', requireAuth, async (req, res) => {
  const {id} = req.params;
  const user = (req as AuthenticatedRequest).user;
  const alert = await repo().findOne({where: {id, userId: user?.id}});
  if (!alert) return res.status(404).json({error: 'alert not found'});
  Object.assign(alert, req.body);
  await repo().save(alert);
  res.json(alert);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const {id} = req.params;
  const user = (req as AuthenticatedRequest).user;
  const alert = await repo().findOne({where: {id, userId: user?.id}});
  if (!alert) return res.status(404).json({error: 'alert not found'});
  await repo().remove(alert);
  res.json({deleted: true});
});

router.post('/evaluate', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const {currentPrice, currentChange} = req.body;
  const alerts = await repo().find({where: {userId: user?.id, active: true}});

  const triggered = [] as Array<{alert: Alert; reason: string}>;
  for (const alert of alerts) {
    const direction = alert.rule.direction;
    const threshold = Number(alert.rule.threshold || 0);
    const value = alert.rule.compareTo === 'change' ? Number(currentChange || 0) : Number(currentPrice || 0);
    const shouldTrigger = direction === 'up' ? value >= threshold : value <= threshold;

    if (shouldTrigger) {
      for (const channel of alert.channels || []) {
        await enqueueNotification({
          type: channel,
          to: user?.email || 'noreply@example.com',
          subject: `Stock alert: ${alert.name}`,
          body: `${alert.targetRef} triggered ${direction} threshold at ${value}`,
        });
      }
      triggered.push({alert, reason: `${alert.name} triggered at ${value}`});
    }
  }

  res.json({triggered, count: triggered.length});
});

export default router;
