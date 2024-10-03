import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let client;

try {
    client = new Redis({
        password: process.env.PASSWORD,
        host: process.env.HOST,
        port: process.env.PORT
    });
} catch (error) {
    console.error('Failed to initialize Redis client:', error);
    process.exit(1);
}

export default client;
