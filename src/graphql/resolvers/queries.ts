import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../../types';

export const queries = {
  // Get current user profile
  me: async (_: unknown, __: unknown, context: GraphQLContext) => {
    try {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return context.user;
    } catch (error) {
      const { message } = error as Error;
      console.error('Failed to fetch user:', { message });
      throw new GraphQLError('Authentication failed', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
  },

  // Get all qualifications
  qualifications: async (_: unknown, __: unknown, context: GraphQLContext) => {
    try {
      return await context.prisma.qualification.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      const { message } = error as Error;
      console.error('Failed to fetch qualifications:', { message });
      throw new GraphQLError('Failed to fetch qualifications', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },
};
