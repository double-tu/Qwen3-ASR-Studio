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
  // The theme logic is no longer needed here as we use explicit styles.
  // const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const removeListener = window.electronAPI.on('recording-state-changed', (state) => {
      setIsRecording(state.isRecording);
      if (state.isRecording) {
        setElapsedTime(Math.floor((Date.now() - state.startTime) / 1000));
        // setTheme(state.theme || 'light');
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

  // The theme useEffect is also no longer needed.
  /*
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  */

  if (!isRecording) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: 'rgba(28, 28, 30, 0.85)', // A semi-transparent dark color
    backdropFilter: 'blur(10px)', // Frosted glass effect
    WebkitBackdropFilter: 'blur(10px)', // For Safari
    borderRadius: '12px',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    boxSizing: 'border-box', // Ensure padding is included in the size
  };

  const iconStyle: React.CSSProperties = {
    width: '22px',
    height: '22px',
    marginRight: '10px',
    color: '#0A84FF', // A vibrant blue
  };

  const textContainerStyle: React.CSSProperties = {
    fontSize: '17px',
    display: 'flex',
    alignItems: 'center',
  };

  const timeStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    marginLeft: '8px',
    minWidth: '55px',
    textAlign: 'left',
    letterSpacing: '0.5px',
  };


  return (
    <div style={overlayStyle}>
      <LoaderIcon style={iconStyle} />
      <div style={textContainerStyle}>
        <span>正在录音</span>
        <span style={timeStyle}>
          {formatTime(elapsedTime)}
        </span>
      </div>
    </div>
  );
}
