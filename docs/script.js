// Elementos del DOM
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const saveModalApisBtn = document.getElementById('saveModalApisBtn');
const saveApisBtn = document.getElementById('saveApisBtn');
const generateWebBtn = document.getElementById('generateWebBtn');
const webPrompt = document.getElementById('webPrompt');
const aiProvider = document.getElementById('aiProvider');
const previewContent = document.getElementById('previewContent');
const mobileView = document.getElementById('mobileView');
const desktopView = document.getElementById('desktopView');
const downloadBtn = document.getElementById('downloadBtn');
const deployBtn = document.getElementById('deployBtn');

// Inputs de APIs
const geminiKey = document.getElementById('geminiKey');
const claudeKey = document.getElementById('claudeKey');
const openaiKey = document.getElementById('openaiKey');
const groqKey = document.getElementById('groqKey');

const modalGeminiKey = document.getElementById('modalGeminiKey');
const modalClaudeKey = document.getElementById('modalClaudeKey');
const modalOpenaiKey = document.getElementById('modalOpenaiKey');
const modalGroqKey = document.getElementById('modalGroqKey');

// Estado de la aplicación
let apiKeys = {
  gemini: '',
  claude: '',
  openai: '',
  groq: ''
};

let generatedWeb = null;

// Funciones de utilidad
const showToast = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
};

const loadApiKeys = () => {
  const saved = localStorage.getItem('nexus-api-keys');
  if (saved) {
    apiKeys = JSON.parse(saved);
    geminiKey.value = apiKeys.gemini;
    claudeKey.value = apiKeys.claude;
    openaiKey.value = apiKeys.openai;
    groqKey.value = apiKeys.groq;

    modalGeminiKey.value = apiKeys.gemini;
    modalClaudeKey.value = apiKeys.claude;
    modalOpenaiKey.value = apiKeys.openai;
    modalGroqKey.value = apiKeys.groq;
  }
};

const saveApiKeys = () => {
  apiKeys = {
    gemini: geminiKey.value,
    claude: claudeKey.value,
    openai: openaiKey.value,
    groq: groqKey.value
  };
  localStorage.setItem('nexus-api-keys', JSON.stringify(apiKeys));
  showToast('APIs guardadas correctamente');
};

const saveModalApiKeys = () => {
  apiKeys = {
    gemini: modalGeminiKey.value,
    claude: modalClaudeKey.value,
    openai: modalOpenaiKey.value,
    groq: modalGroqKey.value
  };
  localStorage.setItem('nexus-api-keys', JSON.stringify(apiKeys));

  // Actualizar inputs principales
  geminiKey.value = apiKeys.gemini;
  claudeKey.value = apiKeys.claude;
  openaiKey.value = apiKeys.openai;
  groqKey.value = apiKeys.groq;

  settingsModal.classList.remove('show');
  showToast('APIs guardadas correctamente');
};

const generateWebPreview = () => {
  const prompt = webPrompt.value.trim();
  const provider = aiProvider.value;

  if (!prompt) {
    showToast('Por favor escribe un prompt para tu web');
    return;
  }

  if (!apiKeys[provider]) {
    showToast(`Por favor configura tu API key de ${provider.toUpperCase()}`);
    return;
  }

  // Simular generación de web
  showToast('Generando web con IA...');

  // Simular tiempo de procesamiento
  setTimeout(() => {
    const mockWeb = generateMockWeb(prompt, provider);
    displayWebPreview(mockWeb);
    generatedWeb = mockWeb;
    downloadBtn.disabled = false;
    deployBtn.disabled = false;
    showToast('¡Web generada exitosamente!');
  }, 2000);
};

const generateMockWeb = (prompt, provider) => {
  // Simular diferentes tipos de webs basadas en el prompt
  const promptLower = prompt.toLowerCase();

  let webType = 'landing';
  let title = 'Mi Sitio Web';
  let description = 'Una web hermosa generada con IA';

  if (promptLower.includes('blog') || promptLower.includes('artículos')) {
    webType = 'blog';
    title = 'Mi Blog Personal';
    description = 'Compartiendo pensamientos e ideas';
  } else if (promptLower.includes('tienda') || promptLower.includes('ecommerce') || promptLower.includes('productos')) {
    webType = 'ecommerce';
    title = 'Mi Tienda Online';
    description = 'Los mejores productos para ti';
  } else if (promptLower.includes('portafolio') || promptLower.includes('portfolio')) {
    webType = 'portfolio';
    title = 'Mi Portafolio';
    description = 'Mis trabajos y proyectos';
  } else if (promptLower.includes('empresa') || promptLower.includes('business')) {
    webType = 'business';
    title = 'Mi Empresa';
    description = 'Soluciones profesionales';
  }

  return {
    type: webType,
    title: title,
    description: description,
    prompt: prompt,
    provider: provider,
    timestamp: new Date().toISOString(),
    html: generateMockHTML(webType, title, description)
  };
};

const generateMockHTML = (type, title, description) => {
  const templates = {
    landing: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { text-align: center; max-width: 600px; }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; }
        .cta-button { background: #ff6b6b; color: white; padding: 15px 30px; border: none; border-radius: 50px; font-size: 1.1rem; cursor: pointer; transition: transform 0.2s; }
        .cta-button:hover { transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <p>${description}</p>
        <button class="cta-button">¡Comenzar Ahora!</button>
    </div>
</body>
</html>`,
    blog: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <style>
        body { font-family: Georgia, serif; margin: 0; padding: 0; background: #f5f5f5; color: #333; }
        header { background: #2c3e50; color: white; padding: 2rem; text-align: center; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .post { background: white; margin-bottom: 2rem; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1, h2 { color: #2c3e50; }
    </style>
</head>
<body>
    <header>
        <h1>${title}</h1>
        <p>${description}</p>
    </header>
    <div class="container">
        <div class="post">
            <h2>Mi Primer Artículo</h2>
            <p>Este es el inicio de mi viaje en el blogging. Aquí compartiré mis pensamientos, experiencias y conocimientos con el mundo.</p>
        </div>
    </div>
</body>
</html>`,
    ecommerce: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
        header { background: #343a40; color: white; padding: 1rem; text-align: center; }
        .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 2rem; max-width: 1200px; margin: 0 auto; }
        .product { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .product img { width: 100%; height: 200px; object-fit: cover; }
        .product-content { padding: 1rem; }
        .price { color: #28a745; font-weight: bold; }
        .buy-btn { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; width: 100%; }
    </style>
</head>
<body>
    <header>
        <h1>${title}</h1>
        <p>${description}</p>
    </header>
    <div class="products">
        <div class="product">
            <img src="https://via.placeholder.com/250x200" alt="Producto 1">
            <div class="product-content">
                <h3>Producto Premium</h3>
                <p class="price">$29.99</p>
                <button class="buy-btn">Comprar</button>
            </div>
        </div>
        <div class="product">
            <img src="https://via.placeholder.com/250x200" alt="Producto 2">
            <div class="product-content">
                <h3>Producto Deluxe</h3>
                <p class="price">$49.99</p>
                <button class="buy-btn">Comprar</button>
            </div>
        </div>
    </div>
</body>
</html>`,
    portfolio: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #111; color: white; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 5rem 2rem; text-align: center; }
        .projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        .project { background: #222; border-radius: 8px; overflow: hidden; transition: transform 0.3s; }
        .project:hover { transform: translateY(-5px); }
        .project img { width: 100%; height: 200px; object-fit: cover; }
        .project-content { padding: 1.5rem; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>${title}</h1>
        <p>${description}</p>
    </div>
    <div class="projects">
        <div class="project">
            <img src="https://via.placeholder.com/300x200" alt="Proyecto 1">
            <div class="project-content">
                <h3>Proyecto Innovador</h3>
                <p>Un proyecto que demuestra creatividad y habilidades técnicas.</p>
            </div>
        </div>
        <div class="project">
            <img src="https://via.placeholder.com/300x200" alt="Proyecto 2">
            <div class="project-content">
                <h3>Solución Elegante</h3>
                <p>Diseño limpio y funcionalidad excepcional.</p>
            </div>
        </div>
    </div>
</body>
</html>`,
    business: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; color: #333; }
        header { background: #f8f9fa; padding: 2rem; text-align: center; border-bottom: 1px solid #e9ecef; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        .service { text-align: center; padding: 2rem; border: 1px solid #e9ecef; border-radius: 8px; }
        .contact { background: #343a40; color: white; padding: 4rem 2rem; text-align: center; }
        .contact-btn { background: #007bff; color: white; border: none; padding: 1rem 2rem; border-radius: 4px; font-size: 1.1rem; cursor: pointer; }
    </style>
</head>
<body>
    <header>
        <h1>${title}</h1>
        <p>${description}</p>
    </header>
    <div class="services">
        <div class="service">
            <h3>Consultoría</h3>
            <p>Asesoramiento experto para tu negocio.</p>
        </div>
        <div class="service">
            <h3>Desarrollo</h3>
            <p>Soluciones tecnológicas a medida.</p>
        </div>
        <div class="service">
            <h3>Soporte</h3>
            <p>Asistencia continua y mantenimiento.</p>
        </div>
    </div>
    <div class="contact">
        <h2>¿Listo para comenzar?</h2>
        <p>Contactanos hoy mismo</p>
        <button class="contact-btn">Contactar</button>
    </div>
</body>
</html>`
  };

  return templates[type] || templates.landing;
};

const displayWebPreview = (web) => {
  const isMobile = mobileView.classList.contains('active');
  const scale = isMobile ? 0.5 : 0.8;

  previewContent.innerHTML = `
    <div style="width: 100%; height: 100%; transform: scale(${scale}); transform-origin: top center;">
      <iframe
        srcdoc="${web.html.replace(/"/g, '&quot;')}"
        style="width: ${isMobile ? '390px' : '1200px'}; height: 600px; border: none; border-radius: 8px;"
        title="Vista previa de la web generada"
      ></iframe>
    </div>
  `;
};

const switchView = (viewType) => {
  mobileView.classList.toggle('active', viewType === 'mobile');
  desktopView.classList.toggle('active', viewType === 'desktop');

  if (generatedWeb) {
    displayWebPreview(generatedWeb);
  }
};

const downloadWeb = () => {
  if (!generatedWeb) return;

  const blob = new Blob([generatedWeb.html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexus-web-${generatedWeb.type}-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Web descargada correctamente');
};

const deployWeb = () => {
  if (!generatedWeb) return;

  showToast('Función de despliegue próximamente disponible');
  // Aquí iría la lógica para desplegar a GitHub Pages
};

// Event listeners
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('show');
});

closeModal.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.remove('show');
  }
});

saveApisBtn.addEventListener('click', saveApiKeys);
saveModalApisBtn.addEventListener('click', saveModalApiKeys);
generateWebBtn.addEventListener('click', generateWebPreview);

mobileView.addEventListener('click', () => switchView('mobile'));
desktopView.addEventListener('click', () => switchView('desktop'));

downloadBtn.addEventListener('click', downloadWeb);
deployBtn.addEventListener('click', deployWeb);

// Permitir generar con Enter
webPrompt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    generateWebPreview();
  }
});

// Inicializar
loadApiKeys();const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const promptResult = document.getElementById('promptResult');
const toast = document.getElementById('toast');

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
};

const generatePreview = (text) => {
  const trimmed = text.trim();
  if (!trimmed) {
    showToast('Escribe tu idea para ver el demo.');
    return;
  }

  const preview = trimmed.length > 100 ? trimmed.slice(0, 100) + '...' : trimmed;
  promptResult.innerHTML = `
    <strong>Prompt enviado:</strong>
    <p>"${preview}"</p>
    <p>Este sitio es una demostración estática para GitHub Pages. En una versión real, NEXUS usaría IA para crear el diseño final.</p>
  `;
  showToast('¡Prompt recibido! Vista previa generada.');
};

generateBtn.addEventListener('click', () => generatePreview(promptInput.value));
promptInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    generatePreview(promptInput.value);
  }
});
