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

// Elementos da visão principal
const logoutButton = document.getElementById('logout-button');

// Onde vamos guardar o token JWT
let token = null;
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
      document.getElementById(`${formId}-form`).classList.add('active');
    });
  });
}
// Função para lidar com o registro de um novo usuário
async function handleRegister(event) {
  event.preventDefault(); // Impede o recarregamento padrão da página pelo formulário
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
    localStorage.setItem('jwt_token', token); // Salva o token no armazenamento local do navegador

    // Troca para a visão principal da aplicação
    showMainView();
  } catch (error) {
    showAuthError(error.message);
  }
}

// Funções auxiliares para mostrar erros e trocar de "tela"
function showAuthError(message) {
  authError.textContent = message;
  authError.classList.remove('hidden');
}

function showMainView() {
  authView.classList.add('hidden');
  mainView.classList.remove('hidden');
  // Futuramente, aqui chamaremos a função para carregar os vídeos
}

// Função principal que inicializa a aplicação
function init() {
  setupTabSwitching();
  registerForm.addEventListener('submit', handleRegister);
  loginForm.addEventListener('submit', handleLogin);
  console.log('App inicializada!');
}

// Roda a função init quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
