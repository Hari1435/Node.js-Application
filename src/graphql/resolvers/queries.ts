import { AuthService } from '../../services/auth.service';
import { GraphQLError } from 'graphql';

export const queries = {
  // Get current user profile
  me: async (_: any, __: any, context: any) => {
    try {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return context.user;
    } catch (error) {
      throw new GraphQLError('Authentication failed', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
  },
};
