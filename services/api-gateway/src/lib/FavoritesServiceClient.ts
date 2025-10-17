import http from 'http';

interface Favorite {
  id: number;
  userId: number;
  videoId: string;
  createdAt: string;
}

export class FavoritesServiceClient {
  private readonly favoritesServiceUrl: string;

  constructor() {
    if (!process.env.FAVORITES_SERVICE_URL) {
      throw new Error('FAVORITES_SERVICE_URL is not defined');
    }
    this.favoritesServiceUrl = process.env.FAVORITES_SERVICE_URL;
  }

  public async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    return new Promise((resolve, reject) => {
      const url = `${this.favoritesServiceUrl}/favorites/${userId}`;
      http
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            return reject(
              new Error(
                `Favorites service responded with status ${res.statusCode}`,
              ),
            );
          }
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data) as Favorite[]);
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
