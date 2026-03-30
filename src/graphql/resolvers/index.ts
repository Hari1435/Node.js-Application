import { queries } from './queries';
import { mutations } from './mutations';

export const resolvers = {
  Query: queries,
  Mutation: mutations,
  User: {
    createdAt: (parent: any) => parent.createdAt.toISOString(),
    dateOfBirth: (parent: any) => parent.dateOfBirth ? parent.dateOfBirth.toISOString() : null,
  },
};
