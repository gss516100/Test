import {Router} from 'express';
import {AppDataSource} from '../config/data-source';
import {Watchlist} from '../entities/Watchlist';
import {requireAuth, AuthenticatedRequest} from '../middlewares/auth';

const router = Router();
const repo = () => AppDataSource.getRepository(Watchlist);

router.get('/', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const items = await repo().find({where: {userId: user?.id}});
  res.json(items);
});

router.post('/', requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const {name, symbols = []} = req.body;
  if (!name) return res.status(400).json({error: 'name required'});
  const watchlist = repo().create({userId: user?.id, name, symbols});
  await repo().save(watchlist);
  res.status(201).json(watchlist);
});

router.put('/:id', requireAuth, async (req, res) => {
  const {id} = req.params;
  const user = (req as AuthenticatedRequest).user;
  const watchlist = await repo().findOne({where: {id, userId: user?.id}});
  if (!watchlist) return res.status(404).json({error: 'watchlist not found'});
  Object.assign(watchlist, req.body);
  await repo().save(watchlist);
  res.json(watchlist);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const {id} = req.params;
  const user = (req as AuthenticatedRequest).user;
  const watchlist = await repo().findOne({where: {id, userId: user?.id}});
  if (!watchlist) return res.status(404).json({error: 'watchlist not found'});
  await repo().remove(watchlist);
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
    const watchlist = repo().create({userId: user?.id, name: item.name, symbols: item.symbols || []});
    return repo().save(watchlist);
  }));
  res.status(201).json(created);
});

export default router;
