import authResolver from './authResolver.js';
import assignPermissionResolver from './assignPermissionResolver.js';
import permissionResolver from './permissionResolver.js';
import roleResolver from './roleResolver.js';

const resolvers = {
  Query: {
    ...authResolver.Query,
    ...roleResolver.Query,
    ...assignPermissionResolver.Query
  },
  Mutation: {
    ...authResolver.Mutation,
    ...roleResolver.Mutation,
    ...assignPermissionResolver.Mutation,
    ...permissionResolver.Mutation
  }
};

export default resolvers;