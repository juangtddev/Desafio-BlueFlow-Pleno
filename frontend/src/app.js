// frontend/app.js

// URL base da nossa API Gateway
const API_URL = 'http://localhost:3000';

// Seleciona todos os elementos da DOM que vamos usar
const authView = document.getElementById('auth-view');
const mainView = document.getElementById('main-view');

// Abas de autenticação
const tabButtons = document.querySelectorAll('.tab-button');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Inputs e mensagens
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const authError = document.getElementById('auth-error');

// Elementos da Busca e Resultados
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
// CORRIGIDO: O ID correto no HTML é 'video-list', não 'results-container'
const resultsContainer = document.getElementById('video-list');
// O ID 'results-error' deve existir no HTML, adicionado à #main-view
const resultsError = document.getElementById('results-error');

// Elementos da visão principal
const logoutButton = document.getElementById('logout-button');

// Onde vamos guardar o token JWT
let token = null;

// Funções auxiliares para mostrar erros e trocar de "tela"

function showAuthError(message) {
  if (authError) {
    authError.textContent = message;
    authError.classList.remove('hidden');
  }
}

function showMainView() {
  if (authView) authView.classList.add('hidden');
  if (mainView) mainView.classList.remove('hidden');
}

function showAuthView() {
  if (authView) authView.classList.remove('hidden');
  if (mainView) mainView.classList.add('hidden');
  // Garante que o formulário de login esteja ativo ao deslogar
  if (document.getElementById('login-form')) {
    document.getElementById('login-form').classList.add('active');
  }
  if (document.getElementById('register-form')) {
    document.getElementById('register-form').classList.remove('active');
  }
}

// --- Lógica Principal ---

// Função para gerenciar a troca de abas
function setupTabSwitching() {
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Remove a classe 'active' de todos os botões e formulários
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      document
        .querySelectorAll('.auth-form')
        .forEach((form) => form.classList.remove('active'));

      // Adiciona a classe 'active' ao botão clicado e ao formulário correspondente
      button.classList.add('active');
      const formId = button.dataset.form; // Pega o valor de 'data-form' (ex: "login")
      const targetForm = document.getElementById(`${formId}-form`);
      if (targetForm) {
        targetForm.classList.add('active');
      }
    });
  });
}

// Função para lidar com o registro de um novo usuário
async function handleRegister(event) {
  event.preventDefault();

  if (!registerEmailInput || !registerPasswordInput) return;

  const email = registerEmailInput.value;
  const password = registerPasswordInput.value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao registrar');
    }

    // Se o registro for bem-sucedido, tenta fazer o login automaticamente
    await handleLogin(null, email, password);
  } catch (error) {
    showAuthError(error.message);
  }
}

// Função para lidar com o login
async function handleLogin(event, prefilledEmail, prefilledPassword) {
  if (event) event.preventDefault();

  if (!loginEmailInput || !loginPasswordInput) return;

  const email = prefilledEmail || loginEmailInput.value;
  const password = prefilledPassword || loginPasswordInput.value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Email ou senha inválidos');
    }

    const data = await response.json();
    token = data.token;
    localStorage.setItem('jwt_token', token);

    // Troca para a visão principal da aplicação
    showMainView();
  } catch (error) {
    showAuthError(error.message);
  }
}

// --- Implemente a função de Logout ---
function handleLogout() {
  token = null;
  localStorage.removeItem('jwt_token');
  showAuthView();
  // Limpar resultados de busca anteriores
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
  if (resultsError) {
    resultsError.classList.add('hidden');
  }
}

// --- Função para renderizar os resultados ---
function renderVideos(videos) {
  if (resultsContainer) {
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores

    if (videos.length === 0) {
      resultsContainer.innerHTML =
        '<p class="no-results">Nenhum vídeo encontrado para a sua busca.</p>';
      return;
    }

    videos.forEach((video) => {
      const videoCard = document.createElement('div');
      videoCard.className = 'video-card';
      videoCard.innerHTML = `
        <a href="${video.url}" target="_blank">
          <img src="${video.thumbnail}" alt="${video.title}">
        </a>
        <div class="video-info">
          <h4><a href="${video.url}" target="_blank">${video.title}</a></h4>
          <p class="source">Fonte: ${video.source}</p>
        </div>
      `;
      resultsContainer.appendChild(videoCard);
    });
  }
}

// --- Função para lidar com a busca ---
async function handleSearch(event) {
  event.preventDefault();

  // Verificação defensiva
  if (!searchInput || !resultsError) return;

  if (!token) {
    showAuthError('Sua sessão expirou. Por favor, faça login novamente.');
    handleLogout();
    return;
  }

  const query = searchInput.value;
  resultsError.classList.add('hidden'); // Esconde erros anteriores

  if (!query.trim()) return; // Ignora busca vazia

  // Opcional: Mostrar um loader/mensagem de carregamento
  if (resultsContainer) {
    resultsContainer.innerHTML = '<p>Buscando vídeos...</p>';
  }

  try {
    console.log('Realizando busca por:', query);
    const response = await fetch(
      `${API_URL}/videos/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // O token é obrigatório para rotas autenticadas!
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 401) {
      // Se a resposta for não autorizada, o token pode ter expirado.
      throw new Error('Sessão expirada ou token inválido.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao realizar a busca.');
    }

    const data = await response.json();
    renderVideos(data.videos || []); // Assume que a resposta tem um campo 'videos'
  } catch (error) {
    resultsError.textContent = error.message;
    resultsError.classList.remove('hidden');
    console.error('Erro na busca:', error);

    // Opcional: Limpar container em caso de erro
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
  }
}

function checkTokenOnLoad() {
  const storedToken = localStorage.getItem('jwt_token');
  if (storedToken) {
    token = storedToken;
    showMainView(); // Troca a view se houver um token válido
  }
}

// --- Função principal que inicializa a aplicação ---
function init() {
  setupTabSwitching();

  // Listeners para os formulários de autenticação
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Listeners para a visão principal
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  if (searchForm) searchForm.addEventListener('submit', handleSearch);

  // Verifica se há token ao iniciar a app
  checkTokenOnLoad();

  console.log('App inicializada!');
}

// Roda a função init quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
