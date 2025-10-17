import { Request, Response, NextFunction } from 'express';
import { AuthServiceClient } from '../lib/AuthServiceClient';

const authClient = new AuthServiceClient();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await authClient.validateToken(token);

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Could not connect to auth service' });
  }
}
