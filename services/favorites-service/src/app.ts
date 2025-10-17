import 'dotenv/config';
import express, { Express } from 'express';
import { setupRoutes } from './routes';

export const app: Express = express();

app.use(express.json());

setupRoutes(app);
