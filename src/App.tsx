import React, { useState, useEffect, useRef } from 'react';
import localforage from 'localforage';
import { ChatSession, Message, ModelOption } from './types';
import { getTimestamp, generateMessageId } from './utils/helpers';
import { ChatSidebar } from './components/ChatSidebar';
import { ModelSelector, modelOptions } from './components/ModelSelector';
import { SystemInstructionModal } from './components/SystemInstructionModal';
import { RenderedMarkdown } from './components/RenderedMarkdown';
import CookieBanner from './components/CookieBanner';
import { useTTS } from './hooks/useTTS';
import { useImageAttachments } from './hooks/useImageAttachments';
import { enableTracking } from './lib/analytics';
import { 
  Send, 
  Settings2, 
  Menu, 
  Sparkles, 
  Volume2, 
  VolumeX,
  X, 
  StopCircle, 
  AlertTriangle,
  Paperclip,
  Check,
  Clipboard,
  Palette,
  Plus
} from 'lucide-react';

const INITIAL_SYSTEM_INSTRUCTION = 'You are a highly competent, helpful, and friendly general assistant.';
const INITIAL_TEMPERATURE = 0.7;

const MessageBubble = React.memo(({ 
  message, 
  getModelFriendlyName,
  speakingMessageId,
  handleToggleSpeak,
  copiedMessageId,
  handleCopyMessage
}: {
  message: Message,
  getModelFriendlyName: (id?: string) => string,
  speakingMessageId: string | null,
  handleToggleSpeak: (id: string, text: string) => void,
  copiedMessageId: string | null,
  handleCopyMessage: (text: string, id: string) => void
}) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`group flex w-full max-w-3xl ${isUser ? 'justify-end' : 'justify-start'} animate-scale-up`}
    >
      <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end max-w-[85%]' : 'items-start w-full'}`}>
        <div 
          className={`${isUser ? 'w-fit rounded-3xl px-6 py-4 shadow-sm' : 'w-full rounded-2xl border border-[var(--theme-border)] px-6 py-5 shadow-sm space-y-4'} leading-relaxed transition-all`}
          style={{ 
            backgroundColor: isUser ? 'var(--theme-bubble-user)' : 'var(--theme-surface)', 
            color: isUser ? 'var(--theme-bubble-user-text, var(--theme-text-primary))' : 'var(--theme-text-primary)'
          }}
        >
          
          {!isUser && (
          <div 
            className="flex items-center justify-between gap-12 mb-3 text-[10px] font-mono leading-none select-none transition-colors border-transparent"
          >
            <span 
              className="font-bold uppercase tracking-wider"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {getModelFriendlyName(message.modelUsed)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleSpeak(message.id, message.text)}
                className={`p-1 rounded transition cursor-pointer ${
                  speakingMessageId === message.id ? 'text-amber-400' : 'text-[var(--theme-text-primary)] hover:text-[var(--theme-highlight)]'
                }`}
                title={speakingMessageId === message.id ? 'Stop Speech' : 'Listen with Speech TTS'}
              >
                {speakingMessageId === message.id ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          )}

          <div className="text-[14px] leading-relaxed">
            {isUser ? (
              <div className="space-y-2">
                {message.images && message.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {message.images.map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt={`attached-${i}`}
                        referrerPolicy="no-referrer"
                        className="max-w-[240px] max-h-[180px] rounded-lg border border-[var(--theme-border)] object-contain bg-[var(--theme-bg)] shadow"
                      />
                    ))}
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed" style={{ color: isUser ? 'var(--theme-bubble-user-text, var(--theme-text-primary))' : 'var(--theme-text-primary)' }}>{message.text}</p>
              </div>
            ) : (
              <RenderedMarkdown text={message.text} />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2">
          <button
            onClick={() => handleCopyMessage(message.text, message.id)}
            className="p-1 rounded transition text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] cursor-pointer"
            title="Copy message"
          >
            {copiedMessageId === message.id ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <Clipboard className="w-3.5 h-3.5" />
            )}
          </button>
          <span className="text-[10px] text-[var(--theme-text-muted)] border-none bg-transparent">{message.timestamp}</span>
        </div>
      </div>
    </div>
  );
});

const GlitterCanvas: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }

    const particles: Particle[] = [];
    const colors = ['#ffffff', '#fcf0f7', '#f79ad3', '#ffd5ec', '#ffe8f4'];

    const createParticle = (x: number, y: number) => {
      const particleCount = 2;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8 - 0.3,
          size: Math.random() * 4 + 2,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      createParticle(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const drawSparkle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size);
      ctx.quadraticCurveTo(0, 0, -size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawSparkle(ctx, p.x, p.y, p.size, p.rotation, p.color, p.alpha);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};

const cuteGreetings = [
  "How can I help you today?",
  "Ready to explore some ideas?",
  "Let's create something wonderful!",
  "What's on your mind?",
  "Hi there! Need a hand?"
];

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [userInput, setUserInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const [selectedModel, setSelectedModel] = useState('azure/ai');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState<{text: string, author: string} | null>(null);

  useEffect(() => {
    // Check if the user has already accepted the cookie banner
    if (localStorage.getItem('alinea_cookie_consent')) {
      enableTracking();
    }
  }, []);

  const fetchRandomQuote = async () => {
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const json = await res.json();
        const quotes = json.data;
        if (quotes && quotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * quotes.length);
          const q = quotes[randomIndex].attributes;
          setCurrentQuote({ text: q.text, author: q.author });
        }
      }
    } catch (e) {
      console.error("Failed to fetch quote", e);
    }
  };

  const [customKeys, setCustomKeys] = useState<Record<string, string>>({
    gemini: '',
    openrouter: '',
    openai: '',
    deepseek: '',
    anthropic: '',
  });
  const [customModels, setCustomModels] = useState<ModelOption[]>([]);

  const getModelFriendlyName = (modelId?: string) => {
    const id = modelId || selectedModel;
    const preset = modelOptions.find((m) => m.id === id);
    if (preset) return preset.name;
    const custom = customModels.find((m) => m.id === id);
    if (custom) return custom.name;

    if (id.startsWith('openrouter/')) {
      const parts = id.split('/');
      const modelName = parts[parts.length - 1];
      return modelName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return id;
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [theme, setTheme] = useState<string>('midnight-lilac');
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [visibleMessageLimit, setVisibleMessageLimit] = useState(30);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopyMessage = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const { pendingImages, setPendingImages, handleAddImages, handlePaste, removePendingImage } = useImageAttachments();
  const { speakingMessageId, setSpeakingMessageId, handleToggleSpeak } = useTTS();



  useEffect(() => {
    const initData = async () => {
      try {
        fetchRandomQuote();

        const storedSessions = await localforage.getItem<string>('chat_sessions');
        const cachedModel = await localforage.getItem<string>('selected_model');
        const savedTheme = await localforage.getItem<string>('alinea_current_theme');

        if (savedTheme && ['velvet-rose', 'midnight-lilac', 'obsidian-gold', 'peach-glow', 'pixie-glitter'].includes(savedTheme)) {
          setTheme(savedTheme);
        }

        try {
          const storedKeys = await localforage.getItem<string>('custom_api_provider_keys');
          if (storedKeys) {
            setCustomKeys(JSON.parse(storedKeys));
          }
          const storedCustomModels = await localforage.getItem<string>('custom_llm_models');
          let parsedCustomModels: ModelOption[] = [];
          if (storedCustomModels) {
            parsedCustomModels = JSON.parse(storedCustomModels);
            setCustomModels(parsedCustomModels);
          }

          if (cachedModel) {
            const isValid = modelOptions.some(m => m.id === cachedModel) || parsedCustomModels.some(m => m.id === cachedModel);
            if (isValid) {
              setSelectedModel(cachedModel);
            } else {
              setSelectedModel('azure/ai');
            }
          }
        } catch (err) {
          console.error('Error loading custom keys or registered models:', err);
        }

        if (storedSessions) {
          const parsed: ChatSession[] = typeof storedSessions === 'string' ? JSON.parse(storedSessions) : storedSessions;
          if (parsed && parsed.length > 0) {
            const dedupedMessages = parsed.map((session) => {
              const seenIds = new Set<string>();
              const uniqueMessages = session.messages.filter((msg) => {
                if (!msg.id || seenIds.has(msg.id)) {
                  return false;
                }
                seenIds.add(msg.id);
                return true;
              });
              return { ...session, messages: uniqueMessages };
            });
            setSessions(dedupedMessages);
            setActiveSessionId(dedupedMessages[0].id);
            return;
          }
        }

        const defaultSession: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'Initial Conversation',
          messages: [],
          model: 'azure/ai',
          systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
          temperature: INITIAL_TEMPERATURE,
          createdAt: new Date().toISOString()
        };
        setSessions([defaultSession]);
        setActiveSessionId(defaultSession.id);
      } catch (err) {
        console.error('State bootstrap error:', err);
      } finally {
        setIsAppLoaded(true);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  useEffect(() => {
    if (sessions.length > 0) {
      localforage.setItem('chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, streamingText, isStreaming]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const effectiveModel = activeSession?.model || selectedModel;

  const handleAddNewSession = () => {
    fetchRandomQuote();

    if (activeSession && activeSession.messages.length === 0) {
      return;
    }

    if (sessions.length > 0 && sessions[0].messages.length === 0) {
      setActiveSessionId(sessions[0].id);
      setErrorBanner(null);
      return;
    }

    const fresh: ChatSession = {
      id: `session-${Date.now()}`,
      title: `Conversation ${sessions.length + 1}`,
      messages: [],
      model: selectedModel,
      systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
      temperature: INITIAL_TEMPERATURE,
      createdAt: new Date().toISOString()
    };
    setSessions([fresh, ...sessions]);
    setActiveSessionId(fresh.id);
    setErrorBanner(null);
  };

  const handleSelectSession = (id: string) => {
    if (isStreaming) {
      handleStopStreaming();
    }
    setActiveSessionId(id);
    setErrorBanner(null);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const filtered = sessions.filter((s) => s.id !== id);
      
      if (filtered.length === 0) {
        await localforage.removeItem('chat_sessions');
        setSessions([]);
        setActiveSessionId('');
      } else {
        setSessions(filtered);
        if (activeSessionId === id && filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handleClearAllSessions = async () => {
    try {
      await localforage.removeItem('chat_sessions');
      setSessions([]);
      setActiveSessionId('');
      setErrorBanner(null);
    } catch (err) {
      console.error('Failed to clear sessions', err);
    }
  };

  const handleSaveConfiguration = async (
    newInstruction: string,
    newTemperature: number,
    apiKeys: Record<string, string>,
    updatedCustomModels: ModelOption[],
    selectedTheme: string
  ) => {
    if (activeSession) {
      setSessions(
        sessions.map((s) =>
          s.id === activeSession.id
            ? { ...s, systemInstruction: newInstruction, temperature: newTemperature }
            : s
        )
      );
    }
    setCustomKeys(apiKeys);
    setCustomModels(updatedCustomModels);
    setTheme(selectedTheme);

    await localforage.setItem('custom_api_provider_keys', JSON.stringify(apiKeys));
    await localforage.setItem('custom_llm_models', JSON.stringify(updatedCustomModels));
    await localforage.setItem('alinea_current_theme', selectedTheme);
  };

  const handleSelectModelSetting = async (modelId: string) => {
    setSelectedModel(modelId);
    await localforage.setItem('selected_model', modelId);
    if (activeSession) {
      setSessions(
        sessions.map((s) =>
          s.id === activeSession.id ? { ...s, model: modelId } : s
        )
      );
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);

      if (activeSession && streamingText.trim()) {
        const fullStreamingMessage: Message = {
          id: `msg-${Date.now()}-partial`,
          role: 'assistant',
          text: streamingText,
          timestamp: getTimestamp(),
          modelUsed: effectiveModel
        };
        setSessions(
          sessions.map((s) =>
            s.id === activeSession.id
              ? { ...s, messages: [...s.messages, fullStreamingMessage] }
              : s
          )
        );
      }
      setStreamingText('');
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || userInput).trim();
    if (!promptToSend || !activeSession || isStreaming) return;

    setUserInput('');
    setErrorBanner(null);

    window.speechSynthesis?.cancel();
    setSpeakingMessageId(null);


    const imagesToPass = [...pendingImages];
    setPendingImages([]);

    const userMessage: Message = {
      id: `msg-${generateMessageId()}-user`,
      role: 'user',
      text: promptToSend,
      images: imagesToPass.length > 0 ? imagesToPass : undefined,
      timestamp: getTimestamp()
    };

    let updatedTitle = activeSession.title;
    if (activeSession.messages.length === 0 || activeSession.title.startsWith('Conversation')) {
      updatedTitle = promptToSend.length > 25 ? `${promptToSend.substring(0, 25).trim()}...` : promptToSend;
    }

    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeSession.id
          ? { ...s, title: updatedTitle, messages: [...s.messages, userMessage] }
          : s
      )
    );

    setTimeout(() => scrollToBottom(), 50);

    setIsStreaming(true);
    setStreamingText('');

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let accumulatedText = '';

    try {
      if (isImageMode || promptToSend.toLowerCase().startsWith('/imagine ')) {
        let imagePrompt = promptToSend;
        if (promptToSend.toLowerCase().startsWith('/imagine ')) {
          imagePrompt = promptToSend.substring(9).trim();
        }
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt })
        });
        
        let aiMessage: Message;
        if (!response.ok) {
          aiMessage = {
            id: `msg-${generateMessageId()}-ai`,
            role: 'assistant',
            text: `Due to safety filters or an internal error, I cannot generate an image for this prompt.`,
            timestamp: getTimestamp()
          };
        } else {
          const data = await response.json();
          aiMessage = {
            id: `msg-${generateMessageId()}-ai`,
            role: 'assistant',
            text: `![Generated Image](${data.imageUrl})`,
            timestamp: getTimestamp()
          };
        }
        
        setSessions(prev => prev.map(s => 
          s.id === activeSession.id
            ? { ...s, messages: [...s.messages, aiMessage] }
            : s
        ));
        
        setIsStreaming(false);
        setTimeout(() => scrollToBottom(), 50);
        return;
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: effectiveModel,
          message: promptToSend,
          images: imagesToPass,
          history: activeSession.messages.map(({ role, text, images }) => ({ role, text, images })),
          systemInstruction: activeSession.systemInstruction || INITIAL_SYSTEM_INSTRUCTION,
          temperature: activeSession.temperature !== undefined ? activeSession.temperature : INITIAL_TEMPERATURE,
          apiKeys: customKeys
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server responded with an execution failure state.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('No readable data stream initialized from server.');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const decodedText = decoder.decode(value, { stream: true });
        const lines = (buffer + decodedText).split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const dataContent = trimmed.substring(6);
            if (dataContent === '[DONE]') {
              break;
            }

            try {
               const payload = JSON.parse(dataContent);
              if (payload.error) {
                throw { isPayloadError: true, message: payload.error };
              }
              if (payload.text) {
                accumulatedText += payload.text;
                setStreamingText(accumulatedText);
              }
            } catch (err: any) {
              if (err && err.isPayloadError) {
                throw new Error(err.message);
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: `msg-${generateMessageId()}-assistant`,
        role: 'assistant',
        text: accumulatedText || 'Could not fetch a valid model response. Check your API configurations.',
        timestamp: getTimestamp(),
        modelUsed: effectiveModel
      };

      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSession.id) {
            const hasUserMsg = s.messages.some((m) => m.id === userMessage.id);
            const baseMessages = hasUserMsg ? s.messages : [...s.messages, userMessage];
            return { ...s, messages: [...baseMessages, assistantMessage] };
          }
          return s;
        })
      );

      setTimeout(() => scrollToBottom(), 50);

    } catch (err: any) {
      if (err.name === 'AbortError') {
         console.log('User cancelled model execution stream.');
      } else {
        console.error('Streaming capture failure:', err);
        setErrorBanner(err.message || 'Stream processing failure occurred.');
        
        if (accumulatedText.trim().length > 0) {
          const assistantMessage: Message = {
            id: `msg-${generateMessageId()}-assistant-salvaged`,
            role: 'assistant',
            text: accumulatedText,
            timestamp: getTimestamp(),
            modelUsed: effectiveModel
          };

          setSessions((prevSessions) =>
            prevSessions.map((s) => {
              if (s.id === activeSession.id) {
                const hasUserMsg = s.messages.some((m) => m.id === userMessage.id);
                const baseMessages = hasUserMsg ? s.messages : [...s.messages, userMessage];
                return { ...s, messages: [...baseMessages, assistantMessage] };
              }
              return s;
            })
          );
        }
      }
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  };




  if (!isAppLoaded) {
    return <div className={`h-screen w-screen theme-${theme} transition-colors duration-300`} style={{ backgroundColor: 'var(--theme-bg)' }} />;
  }

  return (
    <div 
      className={`h-screen w-screen flex flex-col font-sans overflow-hidden text-sm selection:bg-[var(--theme-accent)]/20 selection:text-[var(--theme-highlight)] theme-${theme} transition-colors duration-300`}
      style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-primary)' }}
    >
      <CookieBanner />
      <GlitterCanvas active={theme === 'pixie-glitter'} />
      
      {/* Top Universal Navbar Controls */}
      <header 
        className="h-14 border-b px-4 flex items-center justify-between flex-shrink-0 transition-colors duration-300"
        style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
      >
        
        {/* Left Branding Drawer Toggle */}
        <div className="flex items-center gap-3">
          <div 
            onClick={handleAddNewSession}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            title="Home / New Session"
          >
            <span 
              className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ring-1"
              style={{ 
                background: 'linear-gradient(135deg, var(--theme-secondary), var(--theme-highlight))', 
                color: 'var(--theme-bg)',
                borderColor: 'var(--theme-highlight)' 
              }}
            >
              ⚜
            </span>
            <span className="font-bold tracking-wide text-sm bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-highlight)] bg-clip-text text-transparent">
              Alinea Studio
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'close sidebar' : 'open sidebar'}
            className="p-1.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition cursor-pointer flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Global Realtime API Error Info Banner */}
        {errorBanner && (
          <div className="flex-1 max-w-md mx-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/35 text-rose-300 text-xs animate-fade-in truncate">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-pulse" />
            <span className="truncate pr-1">API Error: {errorBanner}</span>
            <button 
              onClick={() => setErrorBanner(null)}
              className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] font-bold ml-auto text-[10px] pl-1.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dynamic Model Control Panel & Config triggers */}
        <div className="flex items-center gap-2">
          {activeSession && (
            <ModelSelector
              selectedModel={effectiveModel}
              onSelectModel={handleSelectModelSetting}
              customModels={customModels}
            />
          )}

          <button
            onClick={() => setIsConfigOpen(true)}
            title="Configure System Instructions & Temperature"
            className="p-2 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text-primary)] hover:text-[var(--theme-text-primary)] transition active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Structural Layout Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side Sidebar Drawer Panel -> Desktop persistent, mobile slip-drawer */}
        <aside className={`fixed inset-y-0 left-0 md:relative flex-shrink-0 z-40 overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 md:w-[260px] translate-x-0' : 'w-0 -translate-x-full'
        }`}>
          <ChatSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleAddNewSession}
            onRenameSession={handleRenameSession}
            onDeleteSession={handleDeleteSession}
            onClearAllSessions={handleClearAllSessions}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        </aside>

        {/* Mobile sidebar overlay curtain backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        {/* Centered Active Message Canvas Thread */}
        <main 
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleAddImages(e.dataTransfer.files);
            }
          }}
          className="flex-1 h-full min-w-0 flex flex-col overflow-hidden relative bg-[var(--theme-bg)] transition-all duration-300">
          
          {(!activeSession || sessions.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in z-20 relative my-auto">
              <div className="w-16 h-16 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center mx-auto mb-6 overflow-hidden">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-[var(--theme-text-primary)] mb-2">No Active Sessions</h2>
              <p className="text-sm text-[var(--theme-text-muted)] max-w-sm mx-auto mb-8 leading-relaxed">
                Your workspace is currently clear. Start a new conversation to continue interacting.
              </p>
              <button 
                onClick={handleAddNewSession}
                className="mx-auto px-6 py-3 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] rounded-xl font-semibold transition active:scale-95 flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Start a New Session
              </button>
            </div>
          ) : (
            <>
              {/* Active Messages Canvas */}
              <div className="flex flex-col items-center w-full flex-1 overflow-y-auto px-5 py-10 gap-10 relative">
            
            {/* Empty Thread Greeting */}
            {activeSession && activeSession.messages.length === 0 && (
              <div className="w-full max-w-2xl text-center space-y-8 select-none my-auto">
                <div className="w-12 h-12 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--theme-text-primary)] relative animate-fade-in">
                  {cuteGreetings[ activeSession.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % cuteGreetings.length]}
                </h2>
                {currentQuote && (
                  <div className="mt-4 px-6 py-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl animate-fade-in shadow-sm">
                    <p className="text-md text-[var(--theme-text-primary)] italic leading-relaxed">"{currentQuote.text}"</p>
                    <p className="mt-3 text-sm font-semibold text-[var(--theme-highlight)]">— {currentQuote.author}</p>
                  </div>
                )}
              </div>
            )}

            {activeSession && activeSession.messages.length > visibleMessageLimit && (
              <div className="w-full flex justify-center pb-4 pt-2">
                <button
                  onClick={() => setVisibleMessageLimit(prev => prev + 30)}
                  className="px-4 py-1.5 text-[11px] font-bold rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition cursor-pointer tracking-wider uppercase"
                >
                  Load Previous Messages
                </button>
              </div>
            )}
            
            {activeSession && activeSession.messages.slice(-visibleMessageLimit).map((message) => (
              <MessageBubble
                key={message.id}
                message={message}

                getModelFriendlyName={getModelFriendlyName}
                speakingMessageId={speakingMessageId}
                handleToggleSpeak={handleToggleSpeak}
                copiedMessageId={copiedMessageId}
                handleCopyMessage={handleCopyMessage}
              />
            ))}

            {/* Display active real-time streaming blocks */}
            {isStreaming && streamingText && (
              <div className="flex w-full max-w-3xl justify-start animate-fade-in">
                <div 
                  className="w-full rounded-2xl border border-[var(--theme-border)] px-6 py-5 shadow-sm text-[var(--theme-text-primary)] space-y-2"
                  style={{ backgroundColor: 'var(--theme-surface)' }}
                >
                  
                  {/* Meta header */}
                  <div className="flex items-center justify-between gap-12 mb-1 text-[10px] font-mono leading-none select-none">
                    <span className="font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Streaming {getModelFriendlyName(activeSession?.model)}...
                    </span>
                    <span className="text-[var(--theme-text-muted)]">Realtime</span>
                  </div>

                  {/* Rendering partially streamed nodes */}
                  <div className="text-[14px]">
                    <RenderedMarkdown text={streamingText} />
                  </div>
                </div>
              </div>
            )}

            {/* Empty space anchor for scrolling calculations */}
            <div ref={chatEndRef} />
          </div>

          {/* Inline bottom error explanation for responsive views */}
          {errorBanner && (
            <div className="mx-4 mb-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0 animate-bounce" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold font-mono uppercase tracking-wider text-rose-300">API/Connection Error</p>
                  <p className="text-[12px] leading-relaxed text-[var(--theme-text-primary)] select-all">{errorBanner}</p>
                  <p className="text-[10px] text-[var(--theme-text-primary)] leading-normal">
                    Check your API key status or service configurations in <strong className="text-emerald-400">Settings &gt; Secrets</strong>. If running locally, please verify your local <code className="text-[var(--theme-text-muted)]">.env</code> configurations.
                  </p>
                </div>
                <button 
                  onClick={() => setErrorBanner(null)}
                  className="p-1 rounded hover:bg-[var(--theme-surface)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Active Input footer control dock */}
          <footer className="w-full flex justify-center px-4 pb-6 pt-2 bg-transparent">
            <div className="w-full max-w-3xl flex flex-col gap-2">
              <div 
                className="relative flex flex-col rounded-3xl p-3 min-h-12 border transition-all shadow-sm"
                style={{ 
                  backgroundColor: 'var(--theme-surface)', 
                  borderColor: 'var(--theme-border)' 
                }}
              >
                
                {/* Pending attached/pasted images list */}
                {pendingImages.length > 0 && (
                  <div 
                    className="flex flex-wrap gap-2 p-1.5 mb-2 rounded-lg select-none border"
                    style={{ backgroundColor: 'rgba(10, 10, 10, 0.4)', borderColor: 'var(--theme-border)' }}
                  >
                    {pendingImages.map((img, idx) => (
                      <div key={`pre-${idx}`} className="relative group w-14 h-14 rounded-md overflow-hidden border border-[var(--theme-border)] hover:border-[var(--theme-border)] bg-[var(--theme-surface)]">
                        <img 
                          src={img} 
                          alt="clipboard-pasted" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePendingImage(idx)}
                          className="absolute -top-1 -right-1 p-1 bg-black/80 hover:bg-rose-950/90 text-[var(--theme-text-muted)] hover:text-rose-400 rounded-full transition cursor-pointer border border-[var(--theme-border)]"
                          title="Remove attached image"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-start w-full gap-2">
                  {/* Image Mode Toggle */}
                  <button
                    onClick={() => setIsImageMode(!isImageMode)}
                    title={isImageMode ? "Switch to Text Mode" : "Switch to Image Generation Mode"}
                    className={`p-2 mt-0.5 rounded-lg transition flex-shrink-0 cursor-pointer ${
                      isImageMode 
                        ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' 
                        : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-surface-hover)]'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                  </button>

                  {/* Media picker button trigger */}
                  <label className="p-2 mt-0.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-surface-hover)] rounded-lg transition cursor-pointer flex-shrink-0" title="Attach/Browse Images">
                    <Paperclip className="w-4 h-4" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleAddImages(e.target.files);
                          e.target.value = ''; // wipe path
                        }
                      }}
                    />
                  </label>

                  {/* Input area */}
                  <textarea
                    ref={textareaRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      // Send message on Enter keys unless shift-clicked for line break
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const canSend = userInput.trim() || pendingImages.length > 0;
                        if (canSend) {
                          handleSendMessage();
                        }
                      }
                    }}
                    onPaste={handlePaste}
                    rows={1}
                    placeholder={isImageMode ? "Describe an image to generate..." : "Ask Alinea"}
                    className="flex-1 bg-transparent border-none placeholder:text-[var(--theme-text-muted)] text-[var(--theme-text-primary)] text-sm py-1.5 focus:outline-none resize-none leading-relaxed font-sans"
                    style={{ height: 'auto', maxHeight: '180px' }}
                  />

                  {/* Send action or Stream cancel switches */}
                  <div className="flex items-center gap-1.5 self-end">
                    {isStreaming ? (
                      <button
                        onClick={handleStopStreaming}
                        title="Abort current streaming response"
                        className="p-2 bg-rose-950 border border-rose-900 hover:bg-rose-900 rounded-lg text-rose-300 hover:text-[var(--theme-text-primary)] transition cursor-pointer"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={!userInput.trim() && pendingImages.length === 0}
                        title="Send Message"
                        className={`p-2 rounded-lg transition overflow-hidden cursor-pointer ${
                          (userInput.trim() || pendingImages.length > 0)
                            ? 'bg-emerald-500 text-[var(--theme-bg)] hover:bg-emerald-400 active:scale-95 shadow-md shadow-emerald-500/10'
                            : 'bg-[var(--theme-border)] text-[var(--theme-text-primary)] border border-[var(--theme-border)] cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </footer>
          </>)}

        </main>


      </div>

      {/* Model configuration settings panel modal */}
      {activeSession && (
        <SystemInstructionModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          currentInstruction={activeSession.systemInstruction || INITIAL_SYSTEM_INSTRUCTION}
          currentTemperature={activeSession.temperature !== undefined ? activeSession.temperature : INITIAL_TEMPERATURE}
          onSave={handleSaveConfiguration}
          initialKeys={customKeys}
          initialCustomModels={customModels}
          currentTheme={theme}
          selectedModelId={effectiveModel}
        />
      )}
      
    </div>
  );
}
