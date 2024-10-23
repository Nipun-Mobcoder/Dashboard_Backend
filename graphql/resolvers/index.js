import authResolver from './authResolver.js';
import assignPermissionResolver from './assignPermissionResolver.js';
import permissionResolver from './permissionResolver.js';
import roleResolver from './roleResolver.js';
import GraphQLJSON from 'graphql-type-json';
import getPermissionResolver from './getPermissionResolver.js';
import paymentResolver from './paymentResolver.js';
import paymentDashboard from './paymentDashboard.js';

const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    ...authResolver.Query,
    ...roleResolver.Query,
    ...assignPermissionResolver.Query,
    ...permissionResolver.Query,
    ...getPermissionResolver.Query,
    ...paymentDashboard.Query,
    ...paymentResolver.Query
  },
  Mutation: {
    ...authResolver.Mutation,
    ...roleResolver.Mutation,
    ...assignPermissionResolver.Mutation,
    ...permissionResolver.Mutation,
    ...paymentResolver.Mutation
  },
  Subscription: {
    ...paymentResolver.Subscription
  }
};

export default resolvers;