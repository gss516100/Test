import {Router} from 'express';
import authRoutes from './auth';
import watchlistRoutes from './watchlists';
import portfolioRoutes from './portfolios';
import alertRoutes from './alerts';
import reportRoutes from './reports';
import notificationRoutes from './notifications';

const router = Router();

router.use('/auth', authRoutes);
router.use('/watchlists', watchlistRoutes);
router.use('/portfolios', portfolioRoutes);
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

export default router;
