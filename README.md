# Desafio BlueFlow

Solução completa para o desafio BlueFlow, uma aplicação web de microsserviços para listar, pesquisar e favoritar vídeos do YouTube. Este projeto foi desenvolvido com foco em uma arquitetura robusta, testável e seguindo as melhores práticas da indústria.

---

## Descrição do Projeto

BlueFlow é uma aplicação web que utiliza a API oficial do YouTube para permitir que usuários se cadastrem, façam login, pesquisem por vídeos e gerenciem uma lista pessoal de favoritos. O projeto foi construído seguindo uma arquitetura de microsserviços, com o backend e o frontend completamente desacoplados.

## Arquitetura

O sistema é dividido em um frontend (cliente) e um backend composto por múltiplos serviços, orquestrados por um API Gateway.

- **Frontend:** Uma Single-Page Application (SPA) construída com JavaScript puro, responsável por toda a interface e interação do usuário.

- **Backend (Microsserviços):**
  - **API Gateway**: O único ponto de entrada para o cliente. É responsável por receber todas as requisições, validar a autenticação do usuário (consultando o `auth-service`), rotear as chamadas para o microsserviço apropriado e enriquecer os dados antes de retorná-los ao cliente.
  - **Auth Service**: Gerencia o ciclo de vida do usuário: registro, login e validação de tokens JWT. Possui seu próprio schema e tabela `User`.
  - **Videos Service**: Atua como um proxy e adaptador para a API do YouTube, expondo endpoints para busca e listagem de vídeos.
  - **Favorites Service**: Responsável por gerenciar o relacionamento entre usuários e vídeos favoritados. Possui seu próprio schema e tabela `Favorite`.

## Tecnologias Utilizadas

- **Backend:** Node.js, TypeScript, Express.js, Prisma, PostgreSQL
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **DevOps & Geral:** Docker & Docker Compose, pnpm (Monorepo), Jest, `http-proxy-middleware`

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
    Crie os arquivos `.env` em cada um dos serviços de backend, copiando a partir dos arquivos `.env.example`. Preencha os valores, especialmente a `YOUTUBE_API_KEY` e uma `JWT_SECRET` segura.

4.  **Instale as dependências:**
    Na raiz do projeto, execute o comando que instala todas as dependências do monorepo e executa os scripts de build necessários do Prisma (graças à configuração no `package.json` da raiz).

    ```bash
    pnpm install
    ```

5.  **Aplique as Migrações do Banco de Dados:**
    Como cada serviço gerencia seu próprio schema, precisamos rodar as migrações para cada um deles.

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
    Este comando iniciará todos os microsserviços em paralelo.

    ```bash
    pnpm --filter "@blueflow/*" --parallel start:dev
    ```

3.  **Inicie o Frontend:**
    - Use a extensão **"Live Server"** no Visual Studio Code.
    - Navegue até a pasta `frontend/`.
    - Clique com o botão direito no arquivo `index.html` e selecione "Open with Live Server".

---

## Decisões de Arquitetura & Rationale

Esta seção detalha as principais escolhas técnicas e de design feitas durante o desenvolvimento, refletindo o histórico de decisões do projeto.

- **Monorepo com `pnpm` Workspaces:** A escolha por um monorepo foi feita para centralizar a gestão de código e dependências. O `pnpm` foi selecionado sobre `npm`/`yarn` por sua eficiência no uso de disco (via links simbólicos) e sua estrutura de `node_modules` não-plana, que previne "phantom dependencies".

- **API Gateway como Fachada e Orquestrador:** O Gateway implementa dois padrões cruciais:

  1.  **Facade/Proxy:** Ele é o único ponto de entrada, protegendo e escondendo a complexidade da rede interna de microsserviços.
  2.  **Gateway Aggregation:** Na rota de listagem de vídeos, ele orquestra chamadas a dois serviços (`videos-service` e `favorites-service`) para enriquecer a resposta com o status `isFavorited`, simplificando a lógica do cliente.

- **Gerenciamento de Schema com Prisma por Serviço:** A decisão inicial foi que cada serviço que necessita de persistência (`auth` e `favorites`) gerenciaria seu próprio `schema.prisma` e suas próprias migrações.

  - **Trade-off:** Isso promove o isolamento e a autonomia de cada serviço. No entanto, como descoberto durante o desenvolvimento, isso introduz complexidades com o `PrismaClient` em um monorepo, exigindo uma configuração cuidadosa para que os scripts de build do Prisma sejam executados corretamente durante a instalação (`pnpm install`). A solução final envolveu configurar o `package.json` da raiz para permitir explicitamente os scripts de build do Prisma.

- **Segurança: JWT Manual e Hashing:**

  - **Trade-off (JWT):** Devido às restrições do desafio, a geração e validação de JWT foram implementadas manualmente com o módulo `crypto` nativo do Node.js. Em um projeto de produção, a escolha recairia sobre bibliotecas auditadas e robustas como `jsonwebtoken` para evitar vulnerabilidades de implementação.
  - **Hashing:** Foi utilizado o algoritmo `scrypt` para hashing de senhas por sua alta resistência a ataques de força bruta. A verificação é feita com `timingSafeEqual` para mitigar "timing attacks".

- **Isolamento de APIs Externas (Adapter Pattern):** A comunicação com a API do YouTube foi encapsulada em uma classe `YouTubeAdapter`. Isso isola o resto do `videos-service` dos detalhes de implementação da API externa, tornando o código mais limpo, fácil de manter e, crucialmente, permitindo "mockar" o adapter nos testes para execuções rápidas e determinísticas.

- **Frontend "Vanilla" (JavaScript Puro):** A escolha de não usar um framework foi uma restrição do desafio.

  - **Trade-off:** Isso proporciona controle total sobre a DOM e evita o overhead de um framework. Por outro lado, exige a implementação manual de gerenciamento de estado, renderização e manipulação de eventos, o que pode ser menos escalável em aplicações maiores.

- **CORS e `http-proxy-middleware`:** A solução para os erros de CORS foi implementar um middleware customizado no API Gateway. Foi crucial aprender a lidar com as requisições "pre-flight" (`OPTIONS`) e a reescrever o corpo de requisições `POST`/`DELETE`, desafios comuns ao configurar um proxy reverso manualmente.
