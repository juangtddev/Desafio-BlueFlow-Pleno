// services/videos-service/src/index.ts
import 'dotenv/config';
import express from 'express';
import { YouTubeAdapter } from './lib/YoutubeAdapter';

const app = express();
const youtube = new YouTubeAdapter();

app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Query parameter "q" is required' });
  }

  try {
    const videos = await youtube.searchVideos(query);
    return res.status(200).json(videos);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch videos from YouTube' });
  }
});

app.get('/list', async (_req, res) => {
  try {
    const videos = await youtube.listPopularVideos();
    return res.status(200).json(videos);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch popular videos from YouTube' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Videos-service running on port ${PORT}`);
});
