import 'dotenv/config';
import express from 'express';
import { setupRoutes } from './routes';

const app = express();
app.use(express.json());

setupRoutes(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
