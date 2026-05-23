import {Router} from 'express';
import {AppDataSource} from '../config/data-source';
import {Portfolio} from '../entities/Portfolio';
import {requireAuth, AuthenticatedRequest} from '../middlewares/auth';

const router = Router();
const repo = () => AppDataSource.getRepository(Portfolio);

router.get('/', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const items = await repo().find({where: {userId: user?.id}});
  res.json(items);
});

router.post('/', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const {name, holdings = [], metadata = {}} = req.body;
  if (!name) return res.status(400).json({error: 'name required'});
  const portfolio = repo().create({userId: user?.id, name, holdings, metadata});
  await repo().save(portfolio);
  res.status(201).json(portfolio);
});

router.put('/:id', requireAuth, async (req, res) => {
  const {id} = req.params;
  const user = (req as AuthenticatedRequest).user;
  const portfolio = await repo().findOne({where: {id, userId: user?.id}});
  if (!portfolio) return res.status(404).json({error: 'portfolio not found'});
  Object.assign(portfolio, req.body);
  await repo().save(portfolio);
  res.json(portfolio);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const {id} = req.params;
  const user = (req as AuthenticatedRequest).user;
  const portfolio = await repo().findOne({where: {id, userId: user?.id}});
  if (!portfolio) return res.status(404).json({error: 'portfolio not found'});
  await repo().remove(portfolio);
  res.json({deleted: true});
});

router.get('/export', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const items = await repo().find({where: {userId: user?.id}});
  res.json(items);
});

router.post('/import', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const payload = Array.isArray(req.body) ? req.body : [req.body];
  const created = await Promise.all(payload.map(async (item: any) => {
    const portfolio = repo().create({userId: user?.id, name: item.name, holdings: item.holdings || [], metadata: item.metadata || {}});
    return repo().save(portfolio);
  }));
  res.status(201).json(created);
});

export default router;
