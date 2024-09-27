import { Redis } from 'ioredis'
import dotenv from "dotenv"

dotenv.config();

const client = new Redis({
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT
});

export default client;