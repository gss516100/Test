import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-me';

export function signToken(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, {expiresIn: expiresIn as jwt.SignOptions['expiresIn']});
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
