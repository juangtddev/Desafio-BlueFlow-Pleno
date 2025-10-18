const API_URL = 'http://localhost:3000';

// ===================================================================================
// SELETORES DA DOM
// ===================================================================================
const authView = document.getElementById('auth-view');
const mainView = document.getElementById('main-view');
const tabButtons = document.querySelectorAll('.tab-button');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const authError = document.getElementById('auth-error');
const logoutButton = document.getElementById('logout-button');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const videoListContainer = document.getElementById('video-list');
const loadingMessage = document.getElementById('loading-message');
const videoListTitle = document.getElementById('video-list-title');
const favoritesButton = document.getElementById('favorites-button');
const logoButton = document.getElementById('logo-button');

// ===================================================================================
// ESTADO DA APLICAÇÃO
// ===================================================================================
let token = null;

// ===================================================================================
// FUNÇÕES DE RENDERIZAÇÃO E UI
// ===================================================================================
function showAuthView() {
  mainView.classList.add('hidden');
  authView.classList.remove('hidden');
}

function showMainView(view = 'popular') {
  authView.classList.add('hidden');
  mainView.classList.remove('hidden');

  if (view === 'popular') {
    videoListTitle.textContent = 'Vídeos Populares';
    fetchAndRenderVideos(`${API_URL}/videos/list`);
  } else if (view === 'favorites') {
    videoListTitle.textContent = 'Meus Favoritos';
    handleShowFavorites();
  }
}

function showAuthError(message) {
  authError.textContent = message;
  authError.classList.remove('hidden');
}

function renderVideos(videos) {
  videoListContainer.innerHTML = ''; // Limpa a lista
  loadingMessage.classList.add('hidden');

  if (!videos || videos.length === 0) {
    videoListContainer.innerHTML = '<p>Nenhum vídeo encontrado.</p>';
    return;
  }

  videos.forEach((video) => {
    const videoId = video.id?.videoId || video.id;
    if (!videoId || !video.snippet) return;

    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <img src="${video.snippet.thumbnails.default.url}" alt="${
      video.snippet.title
    }" data-video-id="${videoId}">
      <div class="video-info">
        <h3>${video.snippet.title}</h3>
      </div>
      <div class="video-actions">
        <button class="favorite-button ${
          video.isFavorited ? 'active' : ''
        }" data-video-id="${videoId}">
          ${video.isFavorited ? 'Remover Favorito' : 'Favoritar'}
        </button>
      </div>
    `;
    card
      .querySelector('.favorite-button')
      ?.addEventListener('click', handleToggleFavorite);
    card.querySelector('img')?.addEventListener('click', () => {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    });
    videoListContainer.appendChild(card);
  });
}

// ===================================================================================
// LÓGICA DE EVENTOS (HANDLERS)
// ===================================================================================
function setupTabSwitching() {
  /* ...código já existente... */
}
async function handleRegister(event) {
  /* ...código já existente... */
}
async function handleLogin(event, prefilledEmail, prefilledPassword) {
  /* ...código já existente... */
}

function handleLogout() {
  token = null;
  localStorage.removeItem('jwt_token');
  loginForm.reset();
  registerForm.reset();
  showAuthView();
}

async function handleSearch(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    showMainView('popular');
    return;
  }
  videoListTitle.textContent = `Resultados para: "${query}"`;
  fetchAndRenderVideos(
    `${API_URL}/videos/search?q=${encodeURIComponent(query)}`,
  );
}

async function handleShowFavorites() {
  const userId = getUserIdFromToken(token);
  if (!userId) {
    handleLogout();
    return;
  }

  loadingMessage.classList.remove('hidden');
  videoListContainer.innerHTML = '';

  try {
    // 1. Busca os IDs dos vídeos favoritados
    const favsResponse = await fetch(`${API_URL}/favorites/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!favsResponse.ok) throw new Error('Falha ao buscar favoritos');
    const favorites = await favsResponse.json();

    if (favorites.length === 0) {
      renderVideos([]);
      return;
    }

    const videoIds = favorites.map((fav) => fav.videoId);

    // 2. Busca os detalhes desses vídeos (usando o endpoint que vamos criar)
    const detailsResponse = await fetch(`${API_URL}/videos/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: videoIds }),
    });
    if (!detailsResponse.ok)
      throw new Error('Falha ao buscar detalhes dos vídeos');
    const videosWithDetails = await detailsResponse.json();

    // Marca todos como favoritados para a renderização
    const favoritedVideos = videosWithDetails.map((v) => ({
      ...v,
      isFavorited: true,
    }));
    renderVideos(favoritedVideos);
  } catch (error) {
    console.error('Show favorites error:', error);
    loadingMessage.textContent = error.message;
  }
}

async function handleToggleFavorite(event) {
  const button = event.target;
  const videoId = button.dataset.videoId;
  const isFavorited = button.classList.contains('active');
  const userId = getUserIdFromToken(token);
  if (!userId) {
    handleLogout();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: isFavorited ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, videoId }),
    });

    if (!response.ok) {
      const d = await response.json();
      throw new Error(d.message || 'Falha na operação');
    }
    button.classList.toggle('active');
    button.textContent = isFavorited ? 'Favoritar' : 'Remover Favorito';
  } catch (error) {
    console.error('Favorite error:', error);
    alert(error.message);
  }
}

// ===================================================================================
// FUNÇÕES DE API E AUXILIARES
// ===================================================================================
async function fetchAndRenderVideos(url) {
  loadingMessage.textContent = 'Carregando vídeos...';
  loadingMessage.classList.remove('hidden');
  videoListContainer.innerHTML = '';
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }
    if (!response.ok) {
      const d = await response.json();
      throw new Error(d.message || 'Erro ao buscar vídeos');
    }
    const videos = await response.json();
    renderVideos(videos);
  } catch (error) {
    console.error('Fetch videos error:', error);
    loadingMessage.textContent = error.message;
  }
}

function getUserIdFromToken(jwt) {
  /* ...código já existente... */
}

// ===================================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================================================================
function init() {
  setupTabSwitching();
  registerForm.addEventListener('submit', handleRegister);
  loginForm.addEventListener('submit', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  searchForm.addEventListener('submit', handleSearch);
  favoritesButton.addEventListener('click', () => showMainView('favorites'));
  logoButton.addEventListener('click', () => showMainView('popular'));

  const savedToken = localStorage.getItem('jwt_token');
  if (savedToken) {
    token = savedToken;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 > Date.now()) {
      showMainView('popular');
    } else {
      handleLogout();
    }
  } else {
    showAuthView();
  }
}

document.addEventListener('DOMContentLoaded', init);

// Copie as funções setupTabSwitching, handleRegister, handleLogin, e getUserIdFromToken da resposta anterior, elas não mudaram.

// ===================================================================================
// LÓGICA DE EVENTOS (HANDLERS) - Funções que não mudaram
// ===================================================================================
function setupTabSwitching() {
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      authError.classList.add('hidden');
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      document
        .querySelectorAll('.auth-form')
        .forEach((form) => form.classList.remove('active'));
      button.classList.add('active');
      const formId = button.dataset.form;
      document.getElementById(`${formId}-form`).classList.add('active');
    });
  });
}

async function handleRegister(event) {
  event.preventDefault();
  const email = registerEmailInput.value;
  const password = registerPasswordInput.value;
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const d = await response.json();
      throw new Error(d.message || 'Falha ao registrar');
    }
    await handleLogin(null, email, password);
  } catch (error) {
    showAuthError(error.message);
  }
}

async function handleLogin(event, prefilledEmail, prefilledPassword) {
  if (event) event.preventDefault();
  const email = prefilledEmail || loginEmailInput.value;
  const password = prefilledPassword || loginPasswordInput.value;
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const d = await response.json();
      throw new Error(d.message || 'Email ou senha inválidos');
    }
    const data = await response.json();
    token = data.token;
    localStorage.setItem('jwt_token', token);
    showMainView('popular');
  } catch (error) {
    showAuthError(error.message);
  }
}

function getUserIdFromToken(jwt) {
  if (!jwt) return null;
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload.sub;
  } catch (e) {
    console.error('Error decoding token', e);
    return null;
  }
}
