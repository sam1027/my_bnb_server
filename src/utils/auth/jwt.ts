import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret';

export const generateAccessToken = (payload: { id: number, name: string, email: string, role: string }) => {
  return jwt.sign(payload, SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
