import https from 'https';

interface YouTubeVideo {
  id: { videoId: string } | string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
    };
  };
}

export class YouTubeAdapter {
  private readonly apiKey: string;
  private readonly searchBaseUrl =
    'https://www.googleapis.com/youtube/v3/search';
  private readonly videosBaseUrl =
    'https://www.googleapis.com/youtube/v3/videos';

  constructor() {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error(
        'YOUTUBE_API_KEY is not defined in environment variables',
      );
    }
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  public searchVideos(query: string): Promise<YouTubeVideo[]> {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: '10',
        key: this.apiKey,
      });

      const url = `${this.searchBaseUrl}?${params.toString()}`;

      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.error) {
                return reject(new Error(parsedData.error.message));
              }
              resolve(parsedData.items as YouTubeVideo[]);
            } catch (e) {
              reject(e);
            }
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  public listPopularVideos(): Promise<YouTubeVideo[]> {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        part: 'snippet',
        chart: 'mostPopular',
        regionCode: 'BR',
        type: 'video',
        maxResults: '10',
        key: this.apiKey,
      });

      const url = `${this.videosBaseUrl}?${params.toString()}`;

      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.error) {
                return reject(new Error(parsedData.error.message));
              }
              resolve(parsedData.items as YouTubeVideo[]);
            } catch (e) {
              reject(e);
            }
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}
