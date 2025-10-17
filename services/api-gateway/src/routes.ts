import { Express, Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { authMiddleware } from './middlewares/auth';
import { ClientRequest, IncomingMessage } from 'http';
import { FavoritesServiceClient } from './lib/FavoritesServiceClient';

const favoritesClient = new FavoritesServiceClient();

const onProxyReq = (proxyReq: ClientRequest, req: Request, _res: Response) => {
  fixRequestBody(proxyReq, req);
};

const onProxyRes = async (
  proxyRes: IncomingMessage,
  req: Request,
  res: Response,
) => {
  if (
    proxyRes.statusCode === 200 &&
    (req.path.startsWith('/search') || req.path.startsWith('/list'))
  ) {
    const userId = req.user?.id;
    if (!userId) {
      proxyRes.pipe(res);
      return;
    }

    let body = '';
    proxyRes.on('data', (chunk) => {
      body += chunk;
    });
    proxyRes.on('end', async () => {
      try {
        const videos = JSON.parse(body);
        const userFavorites = await favoritesClient.getFavoritesByUserId(
          userId,
        );
        const favoritedVideoIds = new Set(
          userFavorites.map((fav) => fav.videoId),
        );

        const enrichedVideos = videos.map((video) => ({
          ...video,
          isFavorited: favoritedVideoIds.has(video.id?.videoId || video.id),
        }));

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(enrichedVideos));
      } catch (error) {
        console.error('Error enriching video data:', error);
        res.status(500).json({ message: 'Error processing video data' });
      }
    });
  } else {
    proxyRes.pipe(res);
  }
};

export function setupRoutes(app: Express) {
  /**
   * Rota Pública para Autenticação
   */
  app.use(
    '/auth',
    createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: { '^/auth': '' },
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );

  /**
   * Rota Protegida para Vídeos (com enriquecimento de dados)
   */
  app.use(
    '/videos',
    authMiddleware,
    createProxyMiddleware({
      target: process.env.VIDEOS_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: { '^/videos': '' },
      on: {
        proxyReq: onProxyReq,
        proxyRes: onProxyRes,
      },

      selfHandleResponse: true,
    }),
  );

  /**
   * Rota Protegida para Favoritos
   */
  app.use(
    '/favorites',
    authMiddleware,
    createProxyMiddleware({
      target: process.env.FAVORITES_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: { '^/favorites': '' },
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );
}
