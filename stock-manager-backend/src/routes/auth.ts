import {Router, Request} from 'express';
import {AppDataSource} from '../config/data-source';
import {User} from '../entities/User';
import {hashPassword, verifyPassword} from '../utils/hash';
import {signToken} from '../utils/jwt';
import passport from '../config/passport';

const router = Router();

router.post('/signup', async (req, res) => {
  const {email, password, name} = req.body;
  if (!email || !password) return res.status(400).json({error: 'email and password required'});
  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOneBy({email});
  if (existing) return res.status(409).json({error: 'email already exists'});
  const passwordHash = await hashPassword(password);
  const user = repo.create({email, name, passwordHash});
  await repo.save(user);
  const token = signToken({id: user.id, email: user.email});
  res.json({token, user: {id: user.id, email: user.email, name: user.name}});
});

router.post('/signin', async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) return res.status(400).json({error: 'email and password required'});
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({email});
  if (!user || !user.passwordHash) return res.status(401).json({error: 'invalid credentials'});
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({error: 'invalid credentials'});
  const token = signToken({id: user.id, email: user.email});
  res.json({token, user: {id: user.id, email: user.email, name: user.name}});
});

// Google OAuth endpoints
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/google/callback', passport.authenticate('google', {session: false}), (req: Request, res) => {
  const user = req.user as User;
  const token = signToken({id: user.id, email: user.email});
  res.json({token, user: {id: user.id, email: user.email, name: user.name}});
});

export default router;
