// services/favorites-service/src/__tests__/favorites.test.ts

// Importa a ferramenta para fazer requisições HTTP nos testes
import request from 'supertest';

// Importa a "planta baixa" da nossa aplicação do novo arquivo app.ts
// Esta é a mudança mais crucial para que os testes funcionem.
import { app } from '../app';

// Importa o cliente Prisma para preparar e limpar o banco de dados de teste
import { prisma } from '../lib/prisma';

describe('Favorites API', () => {
  // Hook que roda ANTES DE CADA teste (`it` block)
  // Garante que a tabela `Favorite` esteja limpa, isolando cada teste.
  beforeEach(async () => {
    await prisma.favorite.deleteMany({});
  });

  // Hook que roda UMA VEZ, DEPOIS DE TODOS os testes neste arquivo
  // Garante que a conexão com o banco seja fechada corretamente.
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /favorites', () => {
    it('should create a new favorite and return 201', async () => {
      const response = await request(app)
        .post('/favorites')
        .send({ userId: 1, videoId: 'video1' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(1);
    });

    it('should return 409 if the favorite already exists', async () => {
      // Prepara o banco de dados para o cenário de teste
      await prisma.favorite.create({ data: { userId: 1, videoId: 'video1' } });

      // Tenta criar o mesmo favorito novamente
      const response = await request(app)
        .post('/favorites')
        .send({ userId: 1, videoId: 'video1' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /favorites/:userId', () => {
    it('should return a list of favorites for a user', async () => {
      // Prepara o banco com múltiplos favoritos para o mesmo usuário
      await prisma.favorite.createMany({
        data: [
          { userId: 1, videoId: 'videoA' },
          { userId: 1, videoId: 'videoB' },
        ],
      });

      const response = await request(app).get('/favorites/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return an empty array for a user with no favorites', async () => {
      const response = await request(app).get('/favorites/99');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /favorites', () => {
    it('should delete a favorite and return 204', async () => {
      // Prepara o banco com o registro que será deletado
      await prisma.favorite.create({
        data: { userId: 1, videoId: 'video-to-delete' },
      });

      const response = await request(app)
        .delete('/favorites')
        .send({ userId: 1, videoId: 'video-to-delete' });

      expect(response.status).toBe(204);
    });

    it('should return 404 if the favorite to delete does not exist', async () => {
      const response = await request(app)
        .delete('/favorites')
        .send({ userId: 1, videoId: 'non-existent-video' });

      expect(response.status).toBe(404);
    });
  });
});
