const promptInput = document.getElementById('promptInput');
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
