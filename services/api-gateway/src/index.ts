import 'dotenv/config';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
