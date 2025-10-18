// services/api-gateway/src/routes.ts

import { Express, Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { authMiddleware } from './middlewares/auth';
import { ClientRequest, IncomingMessage } from 'http';
import { FavoritesServiceClient } from './lib/FavoritesServiceClient';

// Cria uma instância do cliente para se comunicar com o favorites-service
const favoritesClient = new FavoritesServiceClient();

/**
 * Função helper que é executada ANTES de uma requisição ser enviada ao serviço de destino.
 * Sua função é reescrever o corpo (body) da requisição, que foi consumido pelo
 * middleware `express.json()` e precisa ser retransmitido para o serviço final.
 */
const onProxyReq = (proxyReq: ClientRequest, req: Request, _res: Response) => {
  fixRequestBody(proxyReq, req);
};

/**
 * Função que intercepta a RESPOSTA do videos-service para enriquecê-la.
 * Ela é executada DEPOIS que o videos-service respondeu, mas ANTES que a resposta
 * final seja enviada de volta ao cliente.
 */
const onProxyRes = async (
  proxyRes: IncomingMessage,
  req: Request,
  res: Response,
) => {
  // Só executa a lógica se a requisição foi bem sucedida e é para uma lista de vídeos
  if (
    proxyRes.statusCode === 200 &&
    (req.path.startsWith('/search') || req.path.startsWith('/list'))
  ) {
    const userId = req.user?.id;

    // Se não tivermos um usuário logado, não há como enriquecer os dados.
    // Simplesmente repassa a resposta original.
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

        // Mapeia os vídeos e adiciona a propriedade 'isFavorited'
        const enrichedVideos = videos.map((video) => ({
          ...video,
          isFavorited: favoritedVideoIds.has(video.id?.videoId || video.id),
        }));

        // Envia a resposta modificada (enriquecida) para o cliente
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(enrichedVideos));
      } catch (error) {
        console.error('Error enriching video data:', error);
        res.status(500).json({ message: 'Error processing video data' });
      }
    });
  } else {
    // Para todas as outras requisições (erros, etc.), apenas repassa a resposta original
    proxyRes.pipe(res);
  }
};

export function setupRoutes(app: Express) {
  app.use(
    '/auth',
    createProxyMiddleware({
      target: process.env.AUTH_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: { '^/auth': '' },
      on: { proxyReq: onProxyReq },
    }),
  );

  app.use(
    '/videos',
    authMiddleware,
    createProxyMiddleware({
      target: process.env.VIDEOS_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: { '^/videos': '' },
      on: { proxyReq: onProxyReq, proxyRes: onProxyRes },
      selfHandleResponse: true,
    }),
  );

  app.use(
    '/favorites',
    authMiddleware,
    createProxyMiddleware({
      target: process.env.FAVORITES_SERVICE_URL,
      changeOrigin: true,
      // A REGRA DE REESCRITA AGORA ESTÁ CORRETA E É NECESSÁRIA
      pathRewrite: { '^/favorites': '' },
      on: { proxyReq: onProxyReq },
    }),
  );
}
