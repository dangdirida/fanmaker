'use client';

import React from 'react';

interface EnergyBarProps {
  current: number;
  max: number;
}

export default function EnergyBar({ current, max }: EnergyBarProps) {
  const isEmpty = current === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: max }, (_, i) => {
          const filled = i < current;
          return (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: filled
                  ? isEmpty
                    ? 'rgba(239,68,68,0.8)'
                    : 'rgba(168,85,247,0.9)'
                  : 'rgba(255,255,255,0.15)',
                border: filled
                  ? isEmpty
                    ? '1px solid rgba(239,68,68,0.6)'
                    : '1px solid rgba(168,85,247,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
                transition: 'background 0.3s ease',
              }}
            />
          );
        })}
      </div>
      <span
        style={{
          fontSize: 10,
          color: isEmpty ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.5)',
          fontWeight: isEmpty ? 700 : 400,
        }}
      >
        {current}/{max}
      </span>
    </div>
  );
}
