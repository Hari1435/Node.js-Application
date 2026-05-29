import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export class AuthService {
  // Generate JWT token
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      const { message } = error as Error;
      console.error('Token verification failed:', { message });
      return null;
    }
  }

  // Get user from token
  static async getUserFromToken(token: string, prisma: PrismaClient): Promise<User> {
    const decoded = this.verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        qualification: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
