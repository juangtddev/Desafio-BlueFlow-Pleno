// services/favorites-service/src/app.ts
import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express'; // Importe os tipos
import { setupRoutes } from './routes';

export const app: Express = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  next(); // Continua para a próxima rota
});

// Configura as rotas
setupRoutes(app);
