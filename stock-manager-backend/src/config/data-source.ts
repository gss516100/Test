import 'reflect-metadata';
import {DataSource} from 'typeorm';
import {User} from '../entities/User';
import {Watchlist} from '../entities/Watchlist';
import {Portfolio} from '../entities/Portfolio';
import {Alert} from '../entities/Alert';
import {Report} from '../entities/Report';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/stockmanager';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [User, Watchlist, Portfolio, Alert, Report],
});
