import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv"
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "@apollo/server";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { WebSocketServer } from "ws";

import typeDefs from './graphql/typedef.js';
import resolvers from './graphql/resolvers/index.js';
import connectDB from './config/db.js';

const app = express();
app.use(express.json());
dotenv.config();

const httpServer = http.createServer(app);


const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
});
useServer({ schema }, wsServer);

connectDB();
httpServer.listen(4000, () => {
  console.log("Server ready at http://localhost:4000");
});