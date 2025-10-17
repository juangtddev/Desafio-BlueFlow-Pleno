import 'dotenv/config';
import express, { Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

app.get('/protected', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'You have accessed a protected route!',
    user: req.user,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
