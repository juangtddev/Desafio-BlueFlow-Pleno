# Desafio BlueFlow

Solução completa para o desafio BlueFlow, uma aplicação web de microsserviços para listar, pesquisar e favoritar vídeos do YouTube.

---

## Descrição do Projeto

BlueFlow é uma aplicação web que utiliza a API oficial do YouTube para permitir que usuários se cadastrem, façam login, pesquisem por vídeos e gerenciem uma lista pessoal de favoritos. O projeto foi construído seguindo uma arquitetura de microsserviços, com o backend e o frontend completamente desacoplados.

## Arquitetura

O sistema é dividido em um frontend (cliente) e um backend composto por múltiplos serviços, orquestrados por um API Gateway.

- **Frontend:** Uma Single-Page Application (SPA) construída com JavaScript puro, responsável por toda a interface e interação do usuário.

- **Backend (Microsserviços):**
  - **API Gateway**: O único ponto de entrada para o cliente. É responsável por receber todas as requisições, validar a autenticação do usuário (consultando o `auth-service`) e rotear as chamadas para o microsserviço apropriado.
  - **Auth Service**: Gerencia o ciclo de vida do usuário: registro, login e validação de tokens JWT.
  - **Videos Service**: Atua como um proxy e adaptador para a API do YouTube, expondo endpoints para busca e listagem de vídeos.
  - **Favorites Service**: Responsável por gerenciar o relacionamento entre usuários e vídeos favoritados.

## Tecnologias Utilizadas

- **Backend:** Node.js, TypeScript, Express.js, Prisma, PostgreSQL
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **DevOps & Geral:** Docker & Docker Compose, pnpm (Monorepo), Jest

## Funcionalidades

- Arquitetura de Microsserviços com comunicação interna.
- Fluxo completo de autenticação e autorização com JWT.
- Proteção de rotas que exigem um usuário logado.
- Integração com a API do YouTube para listar vídeos populares e buscar por termos.
- Funcionalidade completa para favoritar e desfavoritar vídeos.
- Visualização da lista de vídeos favoritados pelo usuário.
- Frontend reativo construído com JavaScript puro.
- Testes unitários e de integração no backend.

---

## Como Executar o Projeto

### Pré-requisitos

- Node.js (v18+)
- pnpm
- Docker e Docker Compose

### Configuração do Ambiente

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Obtenha uma Chave da API do YouTube:**

    - Acesse o Google Cloud Console, crie um projeto e ative a **"YouTube Data API v3"**.
    - Crie uma credencial do tipo **"API key"** e copie o valor.

3.  **Configure as Variáveis de Ambiente:**
    Crie os arquivos `.env` em cada um dos serviços de backend, copiando a partir dos arquivos `.env.example`.

    - **`services/auth-service/.env`**:

      ```
      DATABASE_URL="postgresql://docker:docker@localhost:5432/blueflow_db?schema=public"
      JWT_SECRET=sua-chave-secreta-aleatoria
      PORT=3001
      ```

    - **`services/videos-service/.env`**:

      ```
      YOUTUBE_API_KEY=SUA_CHAVE_DA_API_DO_YOUTUBE_AQUI
      PORT=3002
      ```

    - **`services/favorites-service/.env`**:

      ```
      DATABASE_URL="postgresql://docker:docker@localhost:5432/blueflow_db?schema=public"
      PORT=3003
      ```

    - **`services/api-gateway/.env`**:
      ```
      PORT=3000
      AUTH_SERVICE_URL=http://localhost:3001
      VIDEOS_SERVICE_URL=http://localhost:3002
      FAVORITES_SERVICE_URL=http://localhost:3003
      ```

4.  **Instale as dependências:**
    Na raiz do projeto, execute:

    ```bash
    pnpm install
    ```

5.  **Aplique as Migrações do Banco de Dados:**

    ```bash
    # Cria a tabela User
    pnpm --filter "@blueflow/auth-service" exec prisma migrate dev

    # Cria a tabela Favorite
    pnpm --filter "@blueflow/favorites-service" exec prisma migrate dev
    ```

### Executando a Aplicação

1.  **Inicie o Banco de Dados (Docker):**

    ```bash
    docker-compose up -d
    ```

2.  **Inicie todos os serviços de Backend:**

    ```bash
    pnpm --filter "@blueflow/*" --parallel start:dev
    ```

3.  **Inicie o Frontend:**
    - Use a extensão **"Live Server"** no Visual Studio Code.
    - Navegue até a pasta `frontend/`.
    - Clique com o botão direito no arquivo `index.html` e selecione "Open with Live Server".

---

## Como Executar os Testes

Para executar os testes de cada serviço individualmente, use os seguintes comandos a partir da raiz do projeto:

```bash
# Rodar testes do Auth Service
pnpm --filter "@blueflow/auth-service" test

# Rodar testes do Videos Service
pnpm --filter "@blueflow/videos-service" test

# Rodar testes do Favorites Service
pnpm --filter "@blueflow/favorites-service" test
```
