import passport from 'passport';
import {Strategy as GoogleStrategy, Profile} from 'passport-google-oauth20';
import {AppDataSource} from './data-source';
import {User} from '../entities/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback';

passport.serializeUser((user, done) => {
  const typedUser = user as User;
  done(null, typedUser.id);
});
passport.deserializeUser(async (id: string, done) => {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({id});
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const repo = AppDataSource.getRepository(User);
        let user = await repo.findOneBy({googleId: profile.id});
        if (!user) {
          user = repo.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
          });
          user = await repo.save(user);
        }
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

export default passport;
