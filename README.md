# Alinea Studio ✨

A highly responsive, privacy-first, multi-provider AI chat interface designed for developers and researchers. Built with React, Vite, and Tailwind CSS, Alinea Studio provides a blazing fast experience that runs entirely within your browser's local sandbox.

![Alinea Studio](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan.svg)

---

## 🌟 Key Features

* **Multi-Provider Support**: Seamlessly switch between OpenAI, Anthropic Claude, Google Gemini, DeepSeek, and OpenRouter APIs. Add any custom model via the UI.
* **100% Local Privacy**: Your chat history, theme preferences, and API keys are stored securely on your device using IndexedDB (`localforage`). The backend Node server stores absolutely zero user data and operates purely as a secure proxy bridge.
* **Text-to-Speech (TTS) Integration**: Built-in support for ultra-realistic local voice generation powered by Piper TTS.
* **Dynamic Message Windowing**: Enjoy lag-free scrolling even in 1,000+ message threads, thanks to intelligent DOM slicing and message virtualization.
* **Beautiful Theming System**: Switch between curated color palettes like *Velvet Rose*, *Obsidian Gold*, and *Midnight Lilac*.
* **Code Workspace Extraction**: Automatically extracts code blocks from conversations for easy copying, editing, and execution.

---

## 🏗️ Technical Architecture

* **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React Icons, and Framer Motion for micro-animations.
* **Backend**: Express (Node.js) server that proxies API stream calls to protect credentials and handle CORS dynamically.
* **Security**: API Rate Limiting (`express-rate-limit`) implemented out of the box to prevent endpoint abuse during public deployment.

---

## 🚀 Running Locally

### 1. Install Dependencies
Ensure you have Node.js (v18+) installed. Clone the repository and install the packages:
```bash
git clone https://github.com/your-username/Alinea-Studio.git
cd Alinea-Studio
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The server will boot up and be accessible at `http://localhost:3000`.

---

## ☁️ Cloud Deployment (Free Tier)

Alinea Studio is optimized for 100% free cloud deployment across two services.

### 1. TTS Backend (Hugging Face Spaces)
The Python TTS engine (`main.py` and `piper-voices`) is containerized for Hugging Face Spaces.
1. Create a **Docker Space** on Hugging Face.
2. Push the repository code directly to the Space.
3. Hugging Face will automatically build the `Dockerfile` and expose port `7860`.

### 2. Node Web App (Render)
The main Express + React application is designed to run perfectly on Render's free Web Service tier.
1. Create a new **Web Service** on Render and link this repository.
2. Set the Build Command: `npm install && npm run build`
3. Set the Start Command: `npm start`
4. Add the Environment Variable `TTS_API_ENDPOINT` pointing to your new Hugging Face Space URL.

---

## 🛠️ Configuration & Secrets

You do **not** need to hardcode `.env` variables to use the app! Simply launch the app in your browser, open the **Settings** panel, and securely enter your API keys. They will be encrypted in your browser's local sandbox.

---

## 📄 License

MIT License - feel free to fork, modify, and deploy for your own private or public use!
