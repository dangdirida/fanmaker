'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface SaveToastProps {
  show: boolean;
}

export default function SaveToast({ show }: SaveToastProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 16px',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 20,
        color: '#fff',
        fontSize: 13,
        fontWeight: 500,
        opacity: show ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <Check size={14} style={{ color: '#4ade80' }} />
      저장됨
    </div>
  );
}
