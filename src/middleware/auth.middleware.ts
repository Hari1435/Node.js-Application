import { PrismaClient, User } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { IncomingMessage } from 'http';

interface AuthContext {
  user: User | null;
  token: string | null;
}

export async function authMiddleware(req: IncomingMessage, prisma: PrismaClient): Promise<AuthContext> {
  const authHeader = (req.headers as Record<string, string | string[] | undefined>).authorization;
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;

  if (!token) {
    return { user: null, token: null };
  }

  try {
    const user = await AuthService.getUserFromToken(token, prisma);
    return { user, token };
  } catch (error) {
    const { message } = error as Error;
    console.error('Auth middleware error:', { message });
    return { user: null, token: null };
  }
}
