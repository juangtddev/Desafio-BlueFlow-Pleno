# Desafio BlueFlow

Crie uma aplicação **web** com proteção de acesso (**autenticação + autorização**) que **liste, pesquise e permita favoritar vídeos do YouTube** usando a **API oficial e gratuita do YouTube**.

⚠️ **Regra importante**: Use **TypeScript** e **não utilize bibliotecas/frameworks além de**: **Express** e/ou **Nest** (ou similares no mesmo nível). Para testes, é **permitido** usar **Jest** (ou similares) e pode usar o DOTENV(ou similares).


## 🎯 Objetivo
Entregar um sistema **simples, funcional e bem estruturado**, com **frontend** e **backend** separados, construído em **microsserviços** (ex.: `auth-service`, `videos-service`, `favorites-service`).

---

## 🏗️ Arquitetura (exigida)
- Separar em **frontend** e **backend**.
- **Microsserviços** no backend (ex.: serviço de **auth**, **vídeos**, **favoritos**).
- Comunicação entre serviços.
- Aplicar **POO** e **design patterns** adequados (**Factory**, **Strategy**, **Adapter**, etc.).
- Testes automatizados com Jest ou similares.

---

## 🧰 Tecnologias Permitidas
- **TypeScript** em todos os serviços.
- **Express** e/ou **Nest** (ou similares no mesmo nível).
- **Jest** (ou similares) para testes.
- **DOTENV** (ou similares).
- **Proibido**: adicionar outras **libs/frameworks** além dos citados acima.

---

## ✅ Funcionalidades Mínimas
- **Autenticação/Autorização**: fluxo de login e controle de acesso a rotas protegidas.
- **Listagem/Pesquisa**: consumir a **API gratuita do YouTube** para listar e pesquisar vídeos.
- **Favoritos**: marcar/desmarcar vídeos como favoritos **por usuário autenticado**.
- **Persistência**: armazenar **favoritos** e **usuários** (banco à sua escolha; **preferência: PostgreSQL**).

---

## 🧪 O que será avaliado
- **Qualidade do código**: organização, legibilidade, **testes básicos**.
- **Arquitetura**: **isolamento** entre serviços, **contratos claros** e mensagens/erros compreensíveis.
- **Boas práticas**: **SOLID**, tratamento de erros, logs, variáveis de ambiente.
- **Segurança**: proteção de rotas, **armazenamento seguro** de credenciais/chaves.
- **UX essencial**: interface **simples** e **funcional** no frontend.

---

## 💡 Dicas finais
- Documente decisões técnicas e trade-offs.
- Foque no essencial: faça o feijão com arroz.

Prove seu valor e boa sorte!
