// services/favorites-service/src/index.ts
// Este arquivo é o PONTO DE ENTRADA (entrypoint) da aplicação.
// Sua única responsabilidade é importar o app configurado e iniciá-lo.

import { app } from './app'; // Importa a nossa instância do app já pronta do novo arquivo

// Define a porta a partir das variáveis de ambiente, com um fallback
const PORT = process.env.PORT || 3003;

// A condição mais importante para a testabilidade:
// Inicia o servidor APENAS se o ambiente NÃO for de teste.
// O Jest define automaticamente process.env.NODE_ENV como 'test'.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Favorites-service running on port ${PORT}`);
  });
}
