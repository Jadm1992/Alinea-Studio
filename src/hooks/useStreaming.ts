import { useState, useRef } from 'react';
import { Message, ChatSession } from '../types';
import { getTimestamp, generateMessageId } from '../utils/formatters';

interface UseStreamingProps {
  activeSession: ChatSession | undefined;
  effectiveModel: string;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  setErrorBanner: React.Dispatch<React.SetStateAction<string | null>>;
  scrollToBottom: () => void;
}

export function useStreaming({
  activeSession,
  effectiveModel,
  sessions,
  setSessions,
  setErrorBanner,
  scrollToBottom,
}: UseStreamingProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

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

  return {
    isStreaming,
    setIsStreaming,
    streamingText,
    setStreamingText,
    abortControllerRef,
    handleStopStreaming
  };
}
