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
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

import typeDefs from './graphql/typedef.js';
import resolvers from './graphql/resolvers/index.js';
import connectDB from './config/db.js';
import client from "./config/client.js";

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
    context: async ({ req }) => { 
        const token = req.headers.token || '';
        const refresh_token = req.headers.refresh_token || '';
        if(token && token!=="null") {
          try {
            const decoded = jwt.verify(token, process.env.JWT_Secret);
            if(token === await client.get(`token:${decoded?.email}`)) {
              return {
                isLogged: true,
                token,
                decoded
              }
            }
            else if(refresh_token && refresh_token!=="null") {
                  return {
                    refresh_token
                  }
                }
            else {
              throw new Error("Token expired.")
            }
          }
          catch (e) {
            console.log(e);
            throw new GraphQLError(e?.message ?? "Token not vaild", {
              extensions: {
                code: 'UNAUTHENTICATED'
              },
            });
          }
        }
        else if(refresh_token && refresh_token!=="null") {
          return {
            refresh_token
          }
        }  
     },
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