import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { setupRoutes } from './routes';

const app = express();

const allowedOrigin = 'http://127.0.0.1:5500';

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);
// -------------------------

app.use(express.json());

setupRoutes(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
