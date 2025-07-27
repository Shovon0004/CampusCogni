import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  console.log('🔐 Auth check:', { 
    hasAuthHeader: !!authHeader, 
    hasToken: !!token,
    url: req.url,
    method: req.method 
  });

  if (!token) {
    console.log('❌ No token provided');
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET not configured');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    // Map userId/_id to id for compatibility
    if (!user.id) {
      if (user.userId) user.id = user.userId;
      else if (user._id) user.id = user._id;
    }
    req.user = user;
    next();
  })
}

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
