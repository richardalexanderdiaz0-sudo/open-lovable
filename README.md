# NEXUS - PWA

Crea sitios web increíbles escribiendo prompts a la IA. Una **Progressive Web App (PWA)** que funciona offline y se puede instalar en dispositivos móviles y desktop. Hecha por el equipo de [Firecrawl](https://firecrawl.dev/?ref=nexus). Para una solución en la nube completa, revisa [Lovable.dev](https://lovable.dev/) ❤️.

## ✨ Características PWA

- 🚀 **Instalable**: Se puede instalar como una app nativa en móviles y desktop
- 📱 **Responsive**: Funciona perfectamente en todos los dispositivos
- 🔌 **Offline**: Funciona sin conexión a internet (modo cache)
- ⚡ **Rápida**: Carga instantánea con service worker
- 🎨 **Nativa**: Se siente como una app nativa con iconos y splash screen

## 🌐 Demo en Vivo

**URL**: https://richardalexanderdiaz0-sudo.github.io/open-lovable/docs/

**Instalación**: En Chrome/Edge, haz click en "Instalar NEXUS" o en el botón de instalar en la barra de direcciones.

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZtaHFleGRsMTNlaWNydGdianI4NGQ4dHhyZjB0d2VkcjRyeXBucCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZFVLWMa6dVskQX0qu1/giphy.gif" alt="Demostración de NEXUS" width="100%"/>

## Setup

1. **Clone & Install**
```bash
git clone https://github.com/firecrawl/open-lovable.git
cd open-lovable
pnpm install  # or npm install / yarn install
```

2. **Add `.env.local`**

```env
# =================================================================
# REQUIRED
# =================================================================
FIRECRAWL_API_KEY=your_firecrawl_api_key    # https://firecrawl.dev

# =================================================================
# AI PROVIDER - Choose your LLM
# =================================================================
GEMINI_API_KEY=your_gemini_api_key        # https://aistudio.google.com/app/apikey
ANTHROPIC_API_KEY=your_anthropic_api_key  # https://console.anthropic.com
OPENAI_API_KEY=your_openai_api_key        # https://platform.openai.com
GROQ_API_KEY=your_groq_api_key            # https://console.groq.com

# =================================================================
# FAST APPLY (Optional - for faster edits)
# =================================================================
MORPH_API_KEY=your_morphllm_api_key    # https://morphllm.com/dashboard

# =================================================================
# SANDBOX PROVIDER - Choose ONE: Vercel (default) or E2B
# =================================================================
SANDBOX_PROVIDER=vercel  # or 'e2b'

# Option 1: Vercel Sandbox (default)
# Choose one authentication method:

# Method A: OIDC Token (recommended for development)
# Run `vercel link` then `vercel env pull` to get VERCEL_OIDC_TOKEN automatically
VERCEL_OIDC_TOKEN=auto_generated_by_vercel_env_pull

# Method B: Personal Access Token (for production or when OIDC unavailable)
# VERCEL_TEAM_ID=team_xxxxxxxxx      # Your Vercel team ID 
# VERCEL_PROJECT_ID=prj_xxxxxxxxx    # Your Vercel project ID
# VERCEL_TOKEN=vercel_xxxxxxxxxxxx   # Personal access token from Vercel dashboard

# Option 2: E2B Sandbox
# E2B_API_KEY=your_e2b_api_key      # https://e2b.dev
```

3. **Run**
```bash
pnpm dev  # or npm run dev / yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Sitio estático para GitHub Pages

La versión estática lista para GitHub Pages se encuentra en la carpeta `docs/`.

- Si activas GitHub Pages, usa la opción **Source: /docs**.
- El archivo principal es `docs/index.html`.
- Los estilos y el comportamiento están en `docs/styles.css` y `docs/script.js`.

Esta versión es una web estática independiente, lista para desplegarse sin servidor.

## License

MIT