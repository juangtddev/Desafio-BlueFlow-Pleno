import { app } from './app';

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
}
