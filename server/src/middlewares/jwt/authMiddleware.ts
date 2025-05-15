import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../../utils/constants';

interface UserPayload extends JwtPayload {
  id: string;
  role: string;
}

export interface CustomRequest extends Request {
  user?: UserPayload;
}

const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  try {
    let decoded: UserPayload | null = null;

    
    if (bearerToken) {
      decoded = jwt.verify(bearerToken, JWT_SECRET()) as UserPayload;
      req.user = decoded;
      return next();
    }

    
    if (accessToken) {
      decoded = jwt.verify(accessToken, JWT_SECRET()) as UserPayload;
      req.user = decoded;
      return next();
    }

    // 3. If accessToken is missing/expired, use refreshToken to issue new accessToken
    if (refreshToken) {
      decoded = jwt.verify(refreshToken, JWT_SECRET()) as UserPayload;

      const newAccessToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        JWT_SECRET(),
        { expiresIn: '1h' }
      );

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        
        
      });

      req.user = decoded;
      return next();
    }

    
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
return;

  } catch (error) {
    console.error('Error in authentication middleware:', error);
    res.status(403).json({ message: 'Invalid or expired token. Please log in again.' });
    return;
  }
};

export default authMiddleware;
