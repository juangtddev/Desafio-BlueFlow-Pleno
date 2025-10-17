import { Express, Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { authMiddleware } from './middlewares/auth';
import { ClientRequest } from 'http';

/**
 * Função helper que é executada antes de uma requisição ser enviada ao serviço de destino.
 */
const onProxyReq = (proxyReq: ClientRequest, req: Request, _res: Response) => {
  fixRequestBody(proxyReq, req);
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
   * Rota Protegida para Vídeos
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
      },
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
