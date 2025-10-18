// services/api-gateway/src/routes.ts

import { Express, Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { authMiddleware } from './middlewares/auth';
import { ClientRequest, IncomingMessage } from 'http';
import { FavoritesServiceClient } from './lib/FavoritesServiceClient';

// Define a interface para o formato limpo de vídeo, conforme esperado pelo frontend
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  source: string;
  isFavorited?: boolean; // Adicionado pelo enriquecimento
}

const favoritesClient = new FavoritesServiceClient();

const onProxyReq = (proxyReq: ClientRequest, req: Request, _res: Response) => {
  // Garante que o corpo da requisição POST (como login) seja retransmitido corretamente
  fixRequestBody(proxyReq, req);
};

const onProxyRes = async (
  proxyRes: IncomingMessage,
  req: Request,
  res: Response,
) => {
  // Verifica se a resposta foi bem-sucedida e se é uma rota de vídeos que precisa de enriquecimento
  if (
    proxyRes.statusCode === 200 &&
    (req.path.startsWith('/search') || req.path.startsWith('/list'))
  ) {
    const userId = req.user?.id;

    // Se não houver usuário (caso raro, pois a rota tem authMiddleware), apenas envia a resposta
    if (!userId) {
      proxyRes.pipe(res);
      return;
    }

    let body = '';
    // Coleta o corpo da resposta do microserviço
    proxyRes.on('data', (chunk) => {
      body += chunk;
    });

    proxyRes.on('end', async () => {
      try {
        // CORREÇÃO 1: Parseia o corpo da resposta (ex: { videos: [...] })
        const responseData = JSON.parse(body);

        // CORREÇÃO 2: Extrai o array de vídeos para enriquecimento
        const videosArray: Video[] = responseData.videos || [];

        // 1. Busca os favoritos do usuário
        const userFavorites = await favoritesClient.getFavoritesByUserId(
          userId,
        );
        const favoritedVideoIds = new Set(
          userFavorites.map((fav) => fav.videoId),
        );

        // 2. Enriquecimento: Mapeia o array para adicionar 'isFavorited'
        const enrichedVideos = videosArray.map((video) => ({
          ...video,
          // Verifica se o ID do vídeo (que já deve ser o ID limpo) está nos favoritos
          isFavorited: favoritedVideoIds.has(video.id),
        }));

        // 3. Re-envelopa a resposta final para manter o contrato do frontend
        const finalResponse = { videos: enrichedVideos };

        // Envia a resposta enriquecida
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(finalResponse));
      } catch (error) {
        console.error('Error enriching video data:', error);
        // Em caso de falha no enriquecimento, retorna 500
        res.status(500).json({ message: 'Error processing video data' });
      }
    });
  } else {
    // Para rotas não enriquecidas (como favoritos ou auth), apenas repassa a resposta
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
   * O pathRewrite remove /videos, enviando /search e /list para o microserviço
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
      // Necessário para interceptar e modificar a resposta
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
