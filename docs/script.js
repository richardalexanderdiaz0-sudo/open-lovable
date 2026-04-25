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
  generateWebBtn.textContent = generateWebBtn.disabled ? 'Agrega APIs y escribe tu prompt' : 'Construir';
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

webPrompt.addEventListener('input', updateGenerateButtonState);

onAuthStateChanged(auth, (user) => updateUserState(user));
loadApiKeys();
updateGenerateButtonState();
