import { app } from './app';

const PORT = process.env.PORT || 3003;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Favorites-service running on port ${PORT}`);
  });
}
