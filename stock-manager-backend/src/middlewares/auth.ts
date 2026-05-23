import {NextFunction, Request, Response} from 'express';
import {verifyToken} from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {id: string; email: string};
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    res.status(401).json({error: 'missing bearer token'});
    return;
  }

  const payload = verifyToken(token);
  if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
    res.status(401).json({error: 'invalid token'});
    return;
  }

  (req as AuthenticatedRequest).user = {
    id: payload.id,
    email: typeof payload.email === 'string' ? payload.email : '',
  };

  next();
}
