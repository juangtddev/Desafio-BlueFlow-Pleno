// services/favorites-service/src/app.ts

// Carrega as variáveis de ambiente o mais cedo possível
import 'dotenv/config';

// Importa o express e o tipo Express para anotação de tipo
import express, { Express } from 'express';

// Importa a função que configura todas as nossas rotas
import { setupRoutes } from './routes';

// 1. Cria a instância do app e adiciona a anotação de tipo explícita
export const app: Express = express();

// 2. Aplica middlewares globais, como o que permite ao Express entender JSON
app.use(express.json());

// 3. Chama a função que anexa todas as rotas (GET, POST, DELETE) ao app
setupRoutes(app);
