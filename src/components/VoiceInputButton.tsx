import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { parseSpokenNumber } from '../lib/voice';

interface VoiceInputButtonProps {
  onResult: (value: string) => void;
  className?: string;
}

export function VoiceInputButton({ onResult, className = '' }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);

  const startListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check browser compatibility
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('您的瀏覽器不支援語音辨識功能。請改用 Google Chrome, Microsoft Edge 或 Safari 瀏覽器。');
      return;
    }

    if (isListening) {
      // Toggle off is handled by automatic end or stop
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'zh-TW';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsedValue = parseSpokenNumber(transcript);
      if (parsedValue) {
        onResult(parsedValue);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center cursor-pointer outline-none ${
        isListening
          ? 'bg-red-50 hover:bg-red-100 text-red-500 animate-pulse'
          : 'text-slate-400 hover:text-slate-600'
      } ${className}`}
      title={isListening ? '正在聽取語音...' : '語音輸入'}
    >
      {isListening ? (
        <Mic className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
