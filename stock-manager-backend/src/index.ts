import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import {AppDataSource} from './config/data-source';
import passport from './config/passport';
import session from 'express-session';

dotenv.config();

async function main() {
  await AppDataSource.initialize();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(session({secret: process.env.SESSION_SECRET || 'keyboard cat', resave: false, saveUninitialized: false}));
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/health', (_req, res) => res.json({status: 'ok'}));
  app.use('/api', routes);

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start application', err);
  process.exit(1);
});
