import React, { useState, useEffect } from 'react';
import { LoaderIcon } from './icons/LoaderIcon';

type Theme = 'light' | 'dark';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function Overlay() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // @ts-ignore
    const removeListener = window.electronAPI.on('recording-state-changed', (state) => {
      setIsRecording(state.isRecording);
      if (state.isRecording) {
        setElapsedTime(Math.floor((Date.now() - state.startTime) / 1000));
        setTheme(state.theme || 'light');
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    let intervalId: number | null = null;
    if (isRecording) {
      intervalId = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (!isRecording) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-base-100/80 backdrop-blur-sm rounded-lg text-content-100 font-sans">
      <LoaderIcon className="w-6 h-6 mr-3 text-brand-primary" />
      <div className="text-lg">
        <span>正在录音...</span>
        <span className="font-mono ml-2 tabular-nums w-[60px] text-left">
          {formatTime(elapsedTime)}
        </span>
      </div>
    </div>
  );
}
