import 'dotenv/config';
import express from 'express';
import { prisma } from './lib/prisma';
import { Prisma } from '@prisma/client';

const app = express();
app.use(express.json());

app.get('/favorites/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'User ID must be a number' });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId,
      },
    });

    return res.status(200).json(favorites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/favorites', async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    if (
      !userId ||
      !videoId ||
      typeof userId !== 'number' ||
      typeof videoId !== 'string'
    ) {
      return res
        .status(400)
        .json({ message: 'userId (number) and videoId (string) are required' });
    }

    const newFavorite = await prisma.favorite.create({
      data: {
        userId,
        videoId,
      },
    });

    return res.status(201).json(newFavorite);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({
        message: 'This video has already been favorited by this user',
      });
    }

    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Favorites-service running on port ${PORT}`);
});
