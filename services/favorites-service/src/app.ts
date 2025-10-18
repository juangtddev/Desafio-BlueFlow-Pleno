import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import { setupRoutes } from './routes';

export const app: Express = express();

const allowedOrigin = 'http://127.0.0.1:5500';

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.use(express.json());

setupRoutes(app);
