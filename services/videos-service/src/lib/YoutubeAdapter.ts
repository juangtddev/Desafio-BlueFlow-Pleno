import https from 'https';

// --- Interfaces da API do YouTube (Entrada Bruta) ---

interface YouTubeId {
  videoId: string;
}

interface YouTubeSnippet {
  title: string;
  description: string;
  thumbnails: {
    default: { url: string };
  };
}

interface YouTubeVideo {
  // O tipo do ID varia entre o endpoint 'search' (objeto) e 'videos' (string)
  id: YouTubeId | string;
  snippet: YouTubeSnippet;
}

// --- Interface do Frontend/Aplicação (Saída Limpa) ---

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  source: 'YouTube';
}

// --- CLASSE ADAPTER ---

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

  /**
   * Mapeia os dados brutos da API do YouTube para o formato limpo de Video.
   * @param items Array de vídeos no formato YouTubeVideo.
   * @returns Array de vídeos no formato Video.
   */
  private _mapVideos(items: YouTubeVideo[]): Video[] {
    return items
      .map((item) => {
        // Extrai o videoId, lidando com a diferença entre 'search' e 'videos' endpoint
        const videoId =
          typeof item.id === 'string' ? item.id : item.id?.videoId;

        // Se o videoId não for encontrado ou estiver incompleto, pula este item
        if (!videoId) {
          return null;
        }

        const thumbnailUrl = item.snippet?.thumbnails?.default?.url || '';
        const title = item.snippet?.title || 'Título Desconhecido';

        return {
          id: videoId,
          title: title,
          thumbnail: thumbnailUrl,
          // Constrói a URL do YouTube
          url: `https://www.youtube.com/watch?v=${videoId}`,
          source: 'YouTube',
        };
      })
      .filter((video): video is Video => video !== null); // Filtra itens nulos/inválidos
  }

  public searchVideos(query: string): Promise<Video[]> {
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
              const videos = parsedData.items as YouTubeVideo[];

              // PASSO CRUCIAL: Mapear os dados antes de retornar
              resolve(this._mapVideos(videos));
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

  public listPopularVideos(): Promise<Video[]> {
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
              const videos = parsedData.items as YouTubeVideo[];

              // PASSO CRUCIAL: Mapear os dados antes de retornar
              resolve(this._mapVideos(videos));
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
