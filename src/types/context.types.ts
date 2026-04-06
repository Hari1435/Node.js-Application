import { PrismaClient, User } from '@prisma/client';
import { IncomingMessage } from 'http';

export interface GraphQLContext {
  prisma: PrismaClient;
  req: IncomingMessage;
  user: User | null;
  token: string | null;
}
