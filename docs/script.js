import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
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
const hero = document.getElementById('hero');
const dashboardSection = document.getElementById('dashboardSection');
const workspaceSection = document.getElementById('workspaceSection');
const closeWorkspaceBtn = document.getElementById('closeWorkspaceBtn');

const appCount = document.getElementById('appCount');
const dashboardFiles = document.getElementById('dashboardFiles');
const dashboardProvider = document.getElementById('dashboardProvider');
const dashboardProviderLabel = document.getElementById('dashboardProviderLabel');
const historyList = document.getElementById('historyList');

const attachmentBtn = document.getElementById('attachmentBtn');
const webPrompt = document.getElementById('webPrompt');
const modelSelectBtn = document.getElementById('modelSelectBtn');
const generateWebBtn = document.getElementById('generateWebBtn');

const openApisBtn2 = document.getElementById('openApisBtn2');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const saveModalApisBtn = document.getElementById('saveModalApisBtn');
const aiProvider = document.getElementById('aiProvider');
const attachmentInput = document.getElementById('attachmentInput');
const attachmentsList = document.getElementById('attachmentsList');

const previewContent = document.getElementById('previewContent');
const previewFrame = document.getElementById('previewFrame');
const downloadBtn = document.getElementById('downloadBtn');
const deployBtn = document.getElementById('deployBtn');
const statusBanner = document.getElementById('statusBanner');
const previewInfo = document.getElementById('previewInfo');

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

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
let currentProvider = 'openai';
let generatedHtml = '';
let attachments = [];
let appHistory = [];

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
  generateWebBtn.textContent = generateWebBtn.disabled ? 'Agrega APIs y escribe tu prompt' : 'Construir';
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

const handleFileAttachment = (files) => {
  attachments = Array.from(files);
  updateAttachmentsList();
  updateGenerateButtonState();
};

const updateAttachmentsList = () => {
  if (!attachments.length) {
    attachmentsList.innerHTML = '<div class="empty">Aún no has añadido archivos.</div>';
    return;
  }
  attachmentsList.innerHTML = attachments.map((file, index) => `
    <div class="attachment-item">
      <span>${file.name}</span>
      <button type="button" onclick="window.removeAttachment(${index})" class="button button-icon">×</button>
    </div>
  `).join('');
};

const removeAttachment = (index) => {
  attachments.splice(index, 1);
  updateAttachmentsList();
  updateGenerateButtonState();
};

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
  if (saved) apiKeys = JSON.parse(saved);
  const savedProvider = localStorage.getItem('nexus-provider');
  if (savedProvider) currentProvider = savedProvider;
  aiProvider.value = currentProvider;
  modalGeminiKey.value = apiKeys.gemini;
  modalOpenaiKey.value = apiKeys.openai;
  modalClaudeKey.value = apiKeys.claude;
  modalGroqKey.value = apiKeys.groq;
};

const loadAppHistory = () => {
  const saved = localStorage.getItem('nexus-app-history');
  if (saved) appHistory = JSON.parse(saved);
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
    attachments: attachments.map(file => ({ name: file.name, size: file.size, type: file.type }))
  };
  appHistory.unshift(app);
  if (appHistory.length > 10) appHistory = appHistory.slice(0, 10);
  saveAppHistory();
  updateDashboard();
};

const updateDashboard = () => {
  appCount.textContent = appHistory.length;
  dashboardFiles.textContent = attachments.length;
  dashboardProvider.textContent = currentProvider.toUpperCase();
  dashboardProviderLabel.textContent = currentProvider.toUpperCase();

  if (!appHistory.length) {
    historyList.innerHTML = '<div class="empty">Aún no has generado una app. Presiona Construir para crear tu primera web.</div>';
    return;
  }
  historyList.innerHTML = appHistory.map(app => `
    <div class="history-item" onclick="window.loadFromHistory(${app.id})">
      <div class="history-meta">
        <strong>${app.prompt.substring(0, 50)}${app.prompt.length > 50 ? '...' : ''}</strong>
        <small>${new Date(app.timestamp).toLocaleDateString()}</small>
      </div>
      <div class="history-provider">${app.provider.toUpperCase()}</div>
    </div>
  `).join('');
};

const loadFromHistory = (appId) => {
  const app = appHistory.find(item => item.id === appId);
  if (!app) return;
  webPrompt.value = app.prompt;
  currentProvider = app.provider;
  aiProvider.value = currentProvider;
  updateModelButton();
  generatedHtml = app.html;
  renderPreview(app.html);
  downloadBtn.disabled = false;
  deployBtn.disabled = false;
  showToast('App cargada desde el historial');
};

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

const updateUserState = (user) => {
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

const getActiveKey = (provider) => apiKeys[provider] || '';
const validateProvider = (provider) => {
  const key = getActiveKey(provider);
  if (!key) throw new Error(`Debes configurar la clave de ${provider.toUpperCase()}`);
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
  } catch (error) {
    statusBanner.textContent = 'Error en la generación. Revisa tu clave API.';
    showToast(error.message || 'Error en la generación de IA');
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
  if (!response.ok) throw new Error(data.error?.message || 'Fallo en OpenAI');
  return sanitizeResponse(data.choices?.[0]?.message?.content || '');
};

const callGemini = async (prompt, key) => {
  const body = {
    prompt: {
      text: `Genera un sitio web HTML completo con estilo neón morado para este prompt: ${prompt}. Incluye HTML completo, head, body y estilos en línea.`
    },
    temperature: 0.7,
    max_output_tokens: 1500
  };
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Fallo en Gemini');
  return sanitizeResponse(data?.candidates?.[0]?.output || '');
};

const callClaude = async (prompt, key) => {
  const body = {
    model: 'claude-3-haiku-20240307',
    prompt: `Eres un generador de sitios web. Devuelve sólo HTML completo válido para este prompt: ${prompt}.`,
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
  if (!response.ok) throw new Error(data.error?.message || 'Fallo en Claude');
  return sanitizeResponse(data?.completion || '');
};

const callGroq = async (prompt, key) => {
  const body = {
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'Eres un generador de sitios web. Responde exclusivamente con HTML completo y válido.' },
      { role: 'user', content: `Crea un sitio web completo HTML con estilo neón morado para este prompt: ${prompt}.` }
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
  if (!response.ok) throw new Error(data.error?.message || 'Fallo en Groq');
  return sanitizeResponse(data?.choices?.[0]?.message?.content || '');
};

const sanitizeResponse = (content) => content.trim();

const renderPreview = (html) => {
  previewContent.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
  iframe.srcdoc = html;
  previewContent.appendChild(iframe);
  previewFrame.innerHTML = `<iframe srcdoc="${html.replace(/"/g, '&quot;')}"></iframe>`;
};

const initializeChat = () => {
  chatMessages.innerHTML = '<div class="empty">Aquí podrás escribir para modificar tu aplicación en tiempo real.</div>';
};

const sendChatMessage = async () => {
  const message = chatInput.value.trim();
  if (!message) return;
  addChatMessage(message, 'user');
  chatInput.value = '';
  const context = `Modifica la app generada según esta instrucción: ${message}. Responde solo con HTML completo.`;
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

const openModal = () => settingsModal.classList.add('show');
const closeModal = () => settingsModal.classList.remove('show');

attachmentBtn.addEventListener('click', openModal);
modelSelectBtn.addEventListener('click', openModal);
openApisBtn2.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModal);
settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeModal(); });
saveModalApisBtn.addEventListener('click', saveApiKeys);
generateWebBtn.addEventListener('click', generateWeb);
downloadBtn.addEventListener('click', downloadWeb);
deployBtn.addEventListener('click', deployWeb);
loginBtn.addEventListener('click', signInWithGoogle);
registerBtn.addEventListener('click', signInWithGoogle);
logoutBtn.addEventListener('click', signOutUser);
closeWorkspaceBtn.addEventListener('click', showDashboard);
attachmentInput.addEventListener('change', (e) => handleFileAttachment(e.target.files));
chatSendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendChatMessage(); }});
webPrompt.addEventListener('input', updateGenerateButtonState);

window.removeAttachment = removeAttachment;
window.loadFromHistory = loadFromHistory;

onAuthStateChanged(auth, (user) => updateUserState(user));
loadApiKeys();
loadAppHistory();
updateGenerateButtonState();
updateModelButton();
statusBanner.textContent = 'Agrega APIs y escribe tu prompt para comenzar.';
