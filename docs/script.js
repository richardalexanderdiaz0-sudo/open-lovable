import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4t6Tq1bAell9u6V8UcErv1Ee4gFo78y0",
  authDomain: "nexusapp-c0a21.firebaseapp.com",
  databaseURL: "https://nexusapp-c0a21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nexusapp-c0a21",
  storageBucket: "nexusapp-c0a21.firebasestorage.app",
  messagingSenderId: "487113661451",
  appId: "1:487113661451:web:d8407d9235631b7fc6fb0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos del DOM
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userStatus = document.getElementById('userStatus');
const hero = document.getElementById('hero');
const dashboardSection = document.getElementById('dashboardSection');
const workspaceSection = document.getElementById('workspaceSection');
const closeWorkspaceBtn = document.getElementById('closeWorkspaceBtn');

// Dashboard elements
const appCount = document.getElementById('appCount');
const dashboardFiles = document.getElementById('dashboardFiles');
const dashboardProvider = document.getElementById('dashboardProvider');
const dashboardProviderLabel = document.getElementById('dashboardProviderLabel');
const historyList = document.getElementById('historyList');

// Input elements
const attachmentBtn = document.getElementById('attachmentBtn');
const webPrompt = document.getElementById('webPrompt');
const modelSelectBtn = document.getElementById('modelSelectBtn');
const generateWebBtn = document.getElementById('generateWebBtn');

// Modal elements
const openApisBtn = document.getElementById('openApisBtn');
const openApisBtn2 = document.getElementById('openApisBtn2');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const saveModalApisBtn = document.getElementById('saveModalApisBtn');
const aiProvider = document.getElementById('aiProvider');
const attachmentInput = document.getElementById('attachmentInput');
const attachmentsList = document.getElementById('attachmentsList');

// Preview elements
const previewContent = document.getElementById('previewContent');
const previewFrame = document.getElementById('previewFrame');
const downloadBtn = document.getElementById('downloadBtn');
const deployBtn = document.getElementById('deployBtn');
const statusBanner = document.getElementById('statusBanner');
const previewInfo = document.getElementById('previewInfo');

// Chat elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

// API Keys
const modalGeminiKey = document.getElementById('modalGeminiKey');
const modalOpenaiKey = document.getElementById('modalOpenaiKey');
const modalClaudeKey = document.getElementById('modalClaudeKey');
const modalGroqKey = document.getElementById('modalGroqKey');

// Estado de la aplicación
let apiKeys = {
  gemini: '',
  openai: '',
  claude: '',
  groq: ''
};

let currentUser = null;
let generatedHtml = '';
let attachments = [];
let chatHistory = [];
let appHistory = [];
let currentProvider = 'openai';

// Funciones de utilidad
const showToast = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};

const updateGenerateButtonState = () => {
  const hasPrompt = webPrompt.value.trim().length > 0;
  const hasAnyApi = Object.values(apiKeys).some(key => key.trim().length > 0);
  generateWebBtn.disabled = !(hasPrompt && hasAnyApi);
  if (generateWebBtn.disabled) {
    generateWebBtn.textContent = 'Agrega APIs y escribe tu prompt';
  } else {
    generateWebBtn.textContent = 'Construir';
  }
};

const updateModelButton = () => {
  const providerNames = {
    openai: 'OpenAI',
    gemini: 'Gemini',
    claude: 'Claude',
    groq: 'Groq'
  };
  modelSelectBtn.textContent = `Modelo: ${providerNames[currentProvider]}`;
};

// Gestión de archivos adjuntos
const handleFileAttachment = (files) => {
  attachments = Array.from(files);
  updateAttachmentsList();
  updateGenerateButtonState();
};

const updateAttachmentsList = () => {
  if (attachments.length === 0) {
    attachmentsList.innerHTML = '<div class="empty">Aún no has añadido archivos.</div>';
    return;
  }

  attachmentsList.innerHTML = attachments.map((file, index) => `
    <div class="attachment-item">
      <span>${file.name}</span>
      <button onclick="removeAttachment(${index})" class="button button-icon">×</button>
    </div>
  `).join('');
};

const removeAttachment = (index) => {
  attachments.splice(index, 1);
  updateAttachmentsList();
  updateGenerateButtonState();
};

// Gestión de API Keys
const saveApiKeys = () => {
  apiKeys = {
    gemini: modalGeminiKey.value.trim(),
    openai: modalOpenaiKey.value.trim(),
    claude: modalClaudeKey.value.trim(),
    groq: modalGroqKey.value.trim()
  };
  currentProvider = aiProvider.value;
  localStorage.setItem('nexus-api-keys', JSON.stringify(apiKeys));
  localStorage.setItem('nexus-provider', currentProvider);
  settingsModal.classList.remove('show');
  updateModelButton();
  updateGenerateButtonState();
  updateDashboard();
  showToast('Configuración guardada correctamente');
};

const loadApiKeys = () => {
  const saved = localStorage.getItem('nexus-api-keys');
  if (saved) {
    apiKeys = JSON.parse(saved);
  }
  const savedProvider = localStorage.getItem('nexus-provider');
  if (savedProvider) {
    currentProvider = savedProvider;
    aiProvider.value = currentProvider;
  }
  modalGeminiKey.value = apiKeys.gemini;
  modalOpenaiKey.value = apiKeys.openai;
  modalClaudeKey.value = apiKeys.claude;
  modalGroqKey.value = apiKeys.groq;
};

// Gestión de historial
const loadAppHistory = () => {
  const saved = localStorage.getItem('nexus-app-history');
  if (saved) {
    appHistory = JSON.parse(saved);
  }
};

const saveAppHistory = () => {
  localStorage.setItem('nexus-app-history', JSON.stringify(appHistory));
};

const addToHistory = (prompt, html, provider) => {
  const app = {
    id: Date.now(),
    prompt,
    html,
    provider,
    timestamp: new Date().toISOString(),
    attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type }))
  };
  appHistory.unshift(app);
  if (appHistory.length > 10) {
    appHistory = appHistory.slice(0, 10);
  }
  saveAppHistory();
  updateDashboard();
};

// Gestión del dashboard
const updateDashboard = () => {
  appCount.textContent = appHistory.length;
  dashboardFiles.textContent = attachments.length;
  dashboardProvider.textContent = currentProvider.toUpperCase();
  dashboardProviderLabel.textContent = currentProvider.toUpperCase();

  if (appHistory.length === 0) {
    historyList.innerHTML = '<div class="empty">Aún no has generado una app. Presiona Construir para crear tu primera web.</div>';
    return;
  }

  historyList.innerHTML = appHistory.map(app => `
    <div class="history-item" onclick="loadFromHistory(${app.id})">
      <div class="history-meta">
        <strong>${app.prompt.substring(0, 50)}${app.prompt.length > 50 ? '...' : ''}</strong>
        <small>${new Date(app.timestamp).toLocaleDateString()}</small>
      </div>
      <div class="history-provider">${app.provider.toUpperCase()}</div>
    </div>
  `).join('');
};

const loadFromHistory = (appId) => {
  const app = appHistory.find(a => a.id === appId);
  if (!app) return;

  webPrompt.value = app.prompt;
  currentProvider = app.provider;
  aiProvider.value = currentProvider;
  updateModelButton();

  // Cargar archivos si existían
  if (app.attachments && app.attachments.length > 0) {
    // Nota: Los archivos reales no se pueden restaurar desde localStorage
    // Solo mostramos la información
    showToast('Prompt cargado. Los archivos adjuntos no se pueden restaurar.');
  }

  generatedHtml = app.html;
  renderPreview(app.html);
  downloadBtn.disabled = false;
  deployBtn.disabled = false;

  showToast('App cargada desde el historial');
};

// Navegación entre secciones
const showDashboard = () => {
  hero.classList.add('hidden');
  workspaceSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  updateDashboard();
};

const showWorkspace = () => {
  hero.classList.add('hidden');
  dashboardSection.classList.add('hidden');
  workspaceSection.classList.remove('hidden');
  initializeChat();
};

const showHero = () => {
  dashboardSection.classList.add('hidden');
  workspaceSection.classList.add('hidden');
  hero.classList.remove('hidden');
};

// Gestión de autenticación
const updateUserState = (user) => {
  currentUser = user;
  if (user) {
    const display = user.displayName || user.email || 'Usuario';
    userStatus.innerHTML = `<span>Conectado como ${display}</span><p>Tu dashboard está listo. Crea apps y guarda tu progreso.</p>`;
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    showDashboard();
  } else {
    userStatus.innerHTML = `<span>Sin sesión</span><p>Inicia sesión con Google para activar tu dashboard y conservar tus apps generadas.</p>`;
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    showHero();
  }
};

const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    showToast('Sesión iniciada con Google');
  } catch (error) {
    showToast(error.message || 'Error al iniciar sesión con Google');
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
    showToast('Sesión cerrada');
  } catch (error) {
    showToast(error.message || 'Error al cerrar sesión');
  }
};

// Funciones de IA
const getActiveKey = (provider) => {
  return apiKeys[provider] || '';
};

const validateProvider = (provider) => {
  const key = getActiveKey(provider);
  if (!key) {
    throw new Error(`Debes configurar la clave de ${provider.toUpperCase()}`);
  }
  return key;
};

const generateWeb = async () => {
  const prompt = webPrompt.value.trim();
  if (!prompt) {
    showToast('Escribe un prompt para tu web');
    return;
  }

  let key;
  try {
    key = validateProvider(currentProvider);
  } catch (error) {
    showToast(error.message);
    openModal();
    return;
  }

  statusBanner.textContent = 'Generando con IA real...';
  previewInfo.textContent = `Generando con ${currentProvider.toUpperCase()}...`;
  generateWebBtn.disabled = true;
  downloadBtn.disabled = true;
  deployBtn.disabled = true;

  try {
    const html = await callProvider(currentProvider, prompt, key);
    generatedHtml = html;
    addToHistory(prompt, html, currentProvider);
    renderPreview(html);
    downloadBtn.disabled = false;
    deployBtn.disabled = false;
    previewInfo.textContent = `Generado con ${currentProvider.toUpperCase()}`;
    statusBanner.textContent = 'Generación completada. Tu app está lista.';
    showToast('Generación completada con éxito');
    showWorkspace();
  } catch (err) {
    statusBanner.textContent = 'Error en la generación. Revisa tu clave API.';
    showToast(err.message || 'Error en la generación de IA');
  } finally {
    generateWebBtn.disabled = false;
  }
};

const callProvider = async (provider, prompt, key) => {
  if (provider === 'openai') return callOpenAI(prompt, key);
  if (provider === 'gemini') return callGemini(prompt, key);
  if (provider === 'claude') return callClaude(prompt, key);
  if (provider === 'groq') return callGroq(prompt, key);
  throw new Error('Proveedor no soportado');
};

const callOpenAI = async (prompt, key) => {
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres un generador de sitios web. Responde exclusivamente con HTML completo y válido, incluyendo <html>, <head>, <body> y estilos embebidos. No agregues explicaciones.' },
      { role: 'user', content: `Genera un sitio web completo para este prompt: ${prompt}. Usa un estilo morado neón nebuloso, tipografía moderna, animaciones suaves y diseño responsivo.` }
    ],
    temperature: 0.7,
    max_tokens: 3000
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Fallo en OpenAI');
  }

  const content = data.choices?.[0]?.message?.content || '';
  return sanitizeResponse(content);
};

const callGemini = async (prompt, key) => {
  const body = {
    prompt: {
      text: `Genera un sitio web HTML completo con estilo neón morado y aspecto nebuloso para este prompt: ${prompt}. Incluye HTML completo, head, body y estilos en línea. Solo envía HTML.`
    },
    temperature: 0.7,
    max_output_tokens: 1500
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Fallo en Gemini');
  }

  const content = data?.candidates?.[0]?.output || '';
  return sanitizeResponse(content);
};

const callClaude = async (prompt, key) => {
  const body = {
    model: 'claude-3-haiku-20240307',
    prompt: `Eres un generador de sitios web. Devuelve sólo HTML completo válido para el siguiente prompt: ${prompt}. Incluye todos los elementos necesarios y estilo en CSS embebido. No agregues texto adicional.`,
    max_tokens_to_sample: 2000,
    temperature: 0.65
  };

  const response = await fetch('https://api.anthropic.com/v1/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Fallo en Claude');
  }

  const content = data?.completion || '';
  return sanitizeResponse(content);
};

const callGroq = async (prompt, key) => {
  const body = {
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'Eres un generador de sitios web. Responde exclusivamente con HTML completo y válido.' },
      { role: 'user', content: `Crea un sitio web completo HTML con estilo neón morado y aspecto nebuloso para: ${prompt}. Solo devuelve HTML.` }
    ],
    max_tokens: 2000,
    temperature: 0.7
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Fallo en Groq');
  }

  const content = data?.choices?.[0]?.message?.content || '';
  return sanitizeResponse(content);
};

const sanitizeResponse = (content) => {
  return content.trim();
};

const renderPreview = (html) => {
  previewContent.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
  iframe.srcdoc = html;
  previewContent.appendChild(iframe);
  previewFrame.innerHTML = `<iframe srcdoc="${html.replace(/"/g, '&quot;')}"></iframe>`;
};

// Funciones del chat
const initializeChat = () => {
  chatMessages.innerHTML = '<div class="empty">Aquí podrás escribir para modificar tu aplicación en tiempo real.</div>';
  chatHistory = [];
};

const sendChatMessage = async () => {
  const message = chatInput.value.trim();
  if (!message) return;

  // Agregar mensaje del usuario
  addChatMessage(message, 'user');
  chatInput.value = '';

  // Preparar contexto para la IA
  const context = `Tienes esta aplicación web generada: ${generatedHtml.substring(0, 1000)}...
El usuario quiere: ${message}

Modifica el HTML para implementar estos cambios. Responde solo con el HTML completo modificado.`;

  try {
    const key = validateProvider(currentProvider);
    const modifiedHtml = await callProvider(currentProvider, context, key);
    generatedHtml = modifiedHtml;
    renderPreview(modifiedHtml);
    addChatMessage('Aplicación modificada según tu solicitud.', 'ai');
    showToast('Modificación aplicada');
  } catch (error) {
    addChatMessage('Error al modificar: ' + error.message, 'ai');
    showToast('Error en la modificación');
  }
};

const addChatMessage = (text, type) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Funciones de descarga y despliegue
const downloadWeb = () => {
  if (!generatedHtml) return;
  const blob = new Blob([generatedHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexus-app-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Archivo HTML descargado');
};

const deployWeb = () => {
  window.open('https://richardalexanderdiaz0-sudo.github.io/open-lovable/', '_blank');
};

// Gestión del modal
const openModal = () => {
  settingsModal.classList.add('show');
};

const closeModal = () => {
  settingsModal.classList.remove('show');
};

// Event listeners
attachmentBtn.addEventListener('click', () => openModal());
modelSelectBtn.addEventListener('click', () => openModal());
openApisBtn.addEventListener('click', openModal);
openApisBtn2.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModal);
settingsModal.addEventListener('click', (event) => {
  if (event.target === settingsModal) closeModal();
});
saveModalApisBtn.addEventListener('click', saveApiKeys);
generateWebBtn.addEventListener('click', generateWeb);
downloadBtn.addEventListener('click', downloadWeb);
deployBtn.addEventListener('click', deployWeb);
loginBtn.addEventListener('click', signInWithGoogle);
registerBtn.addEventListener('click', signOutUser); // Note: registerBtn uses same function for now
logoutBtn.addEventListener('click', signOutUser);
closeWorkspaceBtn.addEventListener('click', showDashboard);

attachmentInput.addEventListener('change', (e) => handleFileAttachment(e.target.files));
chatSendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChatMessage();
  }
});

webPrompt.addEventListener('input', updateGenerateButtonState);

// Funciones globales para elementos HTML
window.removeAttachment = removeAttachment;
window.loadFromHistory = loadFromHistory;import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4t6Tq1bAell9u6V8UcErv1Ee4gFo78y0",
  authDomain: "nexusapp-c0a21.firebaseapp.com",
  databaseURL: "https://nexusapp-c0a21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nexusapp-c0a21",
  storageBucket: "nexusapp-c0a21.firebasestorage.app",
  messagingSenderId: "487113661451",
  appId: "1:487113661451:web:d8407d9235631b7fc6fb0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userStatus = document.getElementById('userStatus');
const openApisBtn = document.getElementById('openApisBtn');
const openApisBtn2 = document.getElementById('openApisBtn2');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const saveModalApisBtn = document.getElementById('saveModalApisBtn');
const saveApisBtn = document.getElementById('saveApisBtn');
const generateWebBtn = document.getElementById('generateWebBtn');
const webPrompt = document.getElementById('webPrompt');
const aiProvider = document.getElementById('aiProvider');
const previewContent = document.getElementById('previewContent');
const previewFrame = document.getElementById('previewFrame');
const downloadBtn = document.getElementById('downloadBtn');
const deployBtn = document.getElementById('deployBtn');
const statusBanner = document.getElementById('statusBanner');
const previewInfo = document.getElementById('previewInfo');

const geminiKey = document.getElementById('geminiKey');
const openaiKey = document.getElementById('openaiKey');
const claudeKey = document.getElementById('claudeKey');
const groqKey = document.getElementById('groqKey');

const modalGeminiKey = document.getElementById('modalGeminiKey');
const modalOpenaiKey = document.getElementById('modalOpenaiKey');
const modalClaudeKey = document.getElementById('modalClaudeKey');
const modalGroqKey = document.getElementById('modalGroqKey');

let apiKeys = {
  gemini: '',
  openai: '',
  claude: '',
  groq: ''
};

let generatedHtml = '';

const showToast = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};

const saveApiKeys = () => {
  apiKeys = {
    gemini: geminiKey.value.trim(),
    openai: openaiKey.value.trim(),
    claude: claudeKey.value.trim(),
    groq: groqKey.value.trim()
  };
  localStorage.setItem('nexus-api-keys', JSON.stringify(apiKeys));
  showToast('Claves guardadas correctamente');
};

const updateGenerateButtonState = () => {
  const hasPrompt = webPrompt.value.trim().length > 0;
  const hasAnyApi = Object.values(apiKeys).some(key => key.trim().length > 0);
  generateWebBtn.disabled = !(hasPrompt && hasAnyApi);
  if (generateWebBtn.disabled) {
    generateWebBtn.textContent = 'Agrega APIs y escribe tu prompt';
  } else {
    generateWebBtn.textContent = 'Construir';
  }
};

const saveModalApiKeys = () => {
  apiKeys = {
    gemini: modalGeminiKey.value.trim(),
    openai: modalOpenaiKey.value.trim(),
    claude: modalClaudeKey.value.trim(),
    groq: modalGroqKey.value.trim()
  };
  localStorage.setItem('nexus-api-keys', JSON.stringify(apiKeys));
  geminiKey.value = apiKeys.gemini;
  openaiKey.value = apiKeys.openai;
  claudeKey.value = apiKeys.claude;
  groqKey.value = apiKeys.groq;
  settingsModal.classList.remove('show');
  updateGenerateButtonState();
  showToast('Claves guardadas correctamente');
};

const loadApiKeys = () => {
  const saved = localStorage.getItem('nexus-api-keys');
  if (!saved) return;
  apiKeys = JSON.parse(saved);
  geminiKey.value = apiKeys.gemini;
  openaiKey.value = apiKeys.openai;
  claudeKey.value = apiKeys.claude;
  groqKey.value = apiKeys.groq;
  modalGeminiKey.value = apiKeys.gemini;
  modalOpenaiKey.value = apiKeys.openai;
  modalClaudeKey.value = apiKeys.claude;
  modalGroqKey.value = apiKeys.groq;
};

const openApiModal = () => {
  settingsModal.classList.add('show');
};

const closeApiModal = () => {
  settingsModal.classList.remove('show');
};

const updateUserState = (user) => {
  if (user) {
    const display = user.displayName || user.email || 'Usuario';
    userStatus.innerHTML = `<span>Conectado como ${display}</span><p>Listo para generar con tus claves guardadas.</p>`;
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    userStatus.innerHTML = `<span>Sin sesión</span><p>Inicia sesión con Google para guardar tu progreso.</p>`;
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
};

const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    showToast('Sesión iniciada con Google');
  } catch (error) {
    showToast(error.message || 'Error al iniciar sesión con Google');
  }
};

const signInWithEmail = async () => {
  const email = window.prompt('Ingresa tu correo electrónico');
  const password = window.prompt('Ingresa tu contraseña');
  if (!email || !password) return;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast('Sesión iniciada correctamente');
  } catch (error) {
    showToast(error.message || 'Error al iniciar sesión');
  }
};

const registerWithEmail = async () => {
  const email = window.prompt('Ingresa tu correo electrónico');
  const password = window.prompt('Crea una contraseña');
  if (!email || !password) return;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showToast('Cuenta creada y sesión iniciada');
  } catch (error) {
    showToast(error.message || 'Error al crear cuenta');
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
    showToast('Sesión cerrada');
  } catch (error) {
    showToast(error.message || 'Error al cerrar sesión');
  }
};

const getActiveKey = (provider) => {
  return apiKeys[provider] || '';
};

const validateProvider = (provider) => {
  const key = getActiveKey(provider);
  if (!key) {
    throw new Error(`Debes configurar la clave de ${provider.toUpperCase()}`);
  }
  return key;
};

const generateWeb = async () => {
  const prompt = webPrompt.value.trim();
  const provider = document.getElementById('aiProvider') ? document.getElementById('aiProvider').value : 'openai';
  if (!prompt) {
    showToast('Escribe un prompt para tu web');
    return;
  }

  let key;
  try {
    key = validateProvider(provider);
  } catch (error) {
    showToast(error.message);
    return;
  }

  statusBanner.textContent = 'Generando con IA real...';
  previewInfo.textContent = `Generando con ${provider.toUpperCase()}...`;
  generateWebBtn.disabled = true;
  downloadBtn.disabled = true;
  deployBtn.disabled = true;

  try {
    const html = await callProvider(provider, prompt, key);
    generatedHtml = html;
    renderPreview(html);
    downloadBtn.disabled = false;
    deployBtn.disabled = false;
    previewInfo.textContent = `Generado con ${provider.toUpperCase()}`;
    statusBanner.textContent = 'Generación completada. Aquí está tu frontend real.';
    showToast('Generación completada con éxito');
  } catch (err) {
    statusBanner.textContent = 'Error en la generación. Revisa la consola o tu clave API.';
    showToast(err.message || 'Error en la generación de IA');
  } finally {
    generateWebBtn.disabled = false;
  }
};

const callProvider = async (provider, prompt, key) => {
  if (provider === 'openai') return callOpenAI(prompt, key);
  if (provider === 'gemini') return callGemini(prompt, key);
  if (provider === 'claude') return callClaude(prompt, key);
  if (provider === 'groq') return callGroq(prompt, key);
  throw new Error('Proveedor no soportado');
};

const callOpenAI = async (prompt, key) => {
  const body = {
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'Eres un generador de sitios web. Responde exclusivamente con HTML completo y válido, incluyendo <html>, <head>, <body> y estilos embebidos. No agregues explicaciones.' },
      { role: 'user', content: `Genera un sitio web completo para este prompt: ${prompt}. Usa un estilo morado neón nebuloso, tipografía moderna, animaciones suaves y diseño responsivo.` }
    ],
    temperature: 0.7,
    max_tokens: 2500
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Fallo en OpenAI');
  }

  const content = data.choices?.[0]?.message?.content || '';
  return sanitizeResponse(content);
};

const callGemini = async (prompt, key) => {
  const body = {
    prompt: {
      text: `Genera un sitio web HTML completo con estilo neón morado y aspecto nebuloso para este prompt: ${prompt}. Incluye HTML completo, head, body y estilos en línea. Solo envía HTML.`
    },
    temperature: 0.7,
    max_output_tokens: 1200
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Fallo en Gemini');
  }

  const content = data?.candidates?.[0]?.output || '';
  return sanitizeResponse(content);
};

const callClaude = async (prompt, key) => {
  const body = {
    model: 'claude-3.5-sonic',
    prompt: `Eres un generador de sitios web. Devuelve sólo HTML completo válido para el siguiente prompt: ${prompt}. Incluye todos los elementos necesarios y estilo en CSS embebido. No agregues texto adicional.`,
    max_tokens_to_sample: 1800,
    temperature: 0.65
  };

  const response = await fetch('https://api.anthropic.com/v1/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Fallo en Claude');
  }

  const content = data?.completion || '';
  return sanitizeResponse(content);
};

const callGroq = async (prompt, key) => {
  const body = {
    model: 'groq-1.5-mini',
    prompt: `Crea un sitio web completo HTML con estilo neón morado y aspecto nebuloso para: ${prompt}. Solo devuelve HTML.`,
    max_tokens: 1200,
    temperature: 0.7
  };

  const response = await fetch('https://api.groq.dev/v1/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Fallo en Groq');
  }

  const content = data?.completion || '';
  return sanitizeResponse(content);
};

const sanitizeResponse = (content) => {
  return content.trim();
};

const renderPreview = (html) => {
  previewContent.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
  iframe.srcdoc = html;
  previewContent.appendChild(iframe);
  previewFrame.innerHTML = `<iframe srcdoc="${html.replace(/"/g, '&quot;')}"></iframe>`;
};

const downloadWeb = () => {
  if (!generatedHtml) return;
  const blob = new Blob([generatedHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexus-generated-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Archivo HTML descargado');
};

const deployWeb = () => {
  window.open('https://richardalexanderdiaz0-sudo.github.io/open-lovable/', '_blank');
};

openApisBtn.addEventListener('click', openApiModal);
openApisBtn2.addEventListener('click', openApiModal);
closeModal.addEventListener('click', closeApiModal);
settingsModal.addEventListener('click', (event) => {
  if (event.target === settingsModal) closeApiModal();
});
saveApisBtn.addEventListener('click', saveApiKeys);
saveModalApisBtn.addEventListener('click', saveModalApiKeys);
generateWebBtn.addEventListener('click', generateWeb);
downloadBtn.addEventListener('click', downloadWeb);
deployBtn.addEventListener('click', deployWeb);
loginBtn.addEventListener('click', signInWithGoogle);
registerBtn.addEventListener('click', registerWithEmail);
logoutBtn.addEventListener('click', signOutUser);

webPrompt.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    generateWeb();
  }
});

webPrompt.addEventListener('
statusBanner.textContent = 'Agrega APIs y escribe tu prompt para comenzar.';input', updateGenerateButtonState);

onAuthStateChanged(auth, (user) => updateUserState(user));
loadApiKeys();
updateGenerateButtonState();
