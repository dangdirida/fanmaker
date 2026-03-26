'use client';

import React, { useEffect, useState } from 'react';

interface SceneTitleFlashProps {
  title: string | null;
}

export default function SceneTitleFlash({ title }: SceneTitleFlashProps) {
  const [visible, setVisible] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);

  useEffect(() => {
    if (title) {
      setCurrentTitle(title);
      // Fade in
      requestAnimationFrame(() => setVisible(true));
      // Fade out after 1.5s
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [title]);

  if (!currentTitle && !visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      <h1
        style={{
          fontFamily: 'serif',
          fontSize: 'clamp(28px, 6vw, 48px)',
          fontWeight: 700,
          color: '#fff',
          textShadow: '0 2px 16px rgba(0,0,0,0.7), 0 0 40px rgba(168,85,247,0.4)',
          textAlign: 'center',
          padding: '0 24px',
          margin: 0,
        }}
      >
        {currentTitle}
      </h1>
    </div>
  );
}
