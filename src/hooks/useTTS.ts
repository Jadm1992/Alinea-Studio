import { useState, useRef, useEffect } from 'react';

export function useTTS() {
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleSpeak = async (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      // Toggle off
      setSpeakingMessageId(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();

    setSpeakingMessageId(messageId);
    
    // Basic text filtering to avoid spelling code out loud during TTS
    const speakableText = text.replace(/```[\s\S]*?```/g, '[Code snippet omitted from audio review]');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: speakableText })
      });

      if (!response.ok) throw new Error('TTS generation failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audioRef.current = audio;
      
      audio.onended = () => {
        setSpeakingMessageId(null);
        audioRef.current = null;
      };

      audio.play();

    } catch (error) {
      console.warn("External TTS server down, falling back to native browser TTS:", error);
      
      const utterance = new SpeechSynthesisUtterance(speakableText);
      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      utterance.onerror = () => {
        setSpeakingMessageId(null);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return { speakingMessageId, handleToggleSpeak };
}
