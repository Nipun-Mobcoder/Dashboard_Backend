import authResolver from './authResolver.js';
import assignPermissionResolver from './assignPermissionResolver.js';
import permissionResolver from './permissionResolver.js';
import roleResolver from './roleResolver.js';
import GraphQLJSON from 'graphql-type-json';

const resolvers = {
  JSON: GraphQLJSON,
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