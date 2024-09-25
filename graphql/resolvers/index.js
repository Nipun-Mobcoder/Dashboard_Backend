import authResolver from './authResolver.js';
import roleResolver from './roleResolver.js';

const resolvers = {
  Query: {
    ...authResolver.Query,
    ...roleResolver.Query
  },
  Mutation: {
    ...authResolver.Mutation,
    ...roleResolver.Mutation
  }
};

export default resolvers;