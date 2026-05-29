import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { prisma } from './lib/prisma';
import { authMiddleware } from './middleware/auth.middleware';
import { GraphQLContext } from './types';
import dotenv from 'dotenv';

dotenv.config();

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
    context: async ({ req }): Promise<GraphQLContext> => {
      // Apply auth middleware
      const authContext = await authMiddleware(req, prisma);
      
      return {
        prisma,
        req,
        ...authContext,
      };
    },
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer().catch((error) => {
  const { message, stack } = error as Error;
  console.error('Error starting server:', { message, stack });
  process.exit(1);
});
