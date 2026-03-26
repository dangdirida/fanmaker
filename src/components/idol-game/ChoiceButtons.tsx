'use client';

import React from 'react';
import type { ChoiceData } from '@/lib/idol-game/sceneEngine';

interface ChoiceButtonsProps {
  choices: ChoiceData[];
  onChoice: (index: number) => void;
  disabled?: boolean;
}

export default function ChoiceButtons({ choices, onChoice, disabled }: ChoiceButtonsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        marginTop: 8,
      }}
      className="choice-buttons-grid"
    >
      {choices.map((choice, index) => (
        <button
          key={index}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onChoice(index);
          }}
          style={{
            position: 'relative',
            padding: '10px 14px',
            background: 'rgba(168,85,247,0.2)',
            border: choice.isCamera
              ? '1px solid rgba(244,114,182,0.6)'
              : '1px solid rgba(168,85,247,0.4)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'left',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'background 0.2s, transform 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              const el = e.currentTarget;
              el.style.background = 'rgba(168,85,247,0.3)';
              el.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = 'rgba(168,85,247,0.2)';
            el.style.transform = 'translateY(0)';
          }}
        >
          {/* Bonus label badge */}
          {choice.bonusLabel && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: 8,
                padding: '1px 6px',
                background: 'rgba(168,85,247,0.7)',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                color: '#fff',
                whiteSpace: 'nowrap',
              }}
            >
              {choice.bonusLabel}
            </span>
          )}

          <div>{choice.text}</div>

          {choice.subText && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              {choice.subText}
            </div>
          )}
        </button>
      ))}

      {/* Responsive: 1 column on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .choice-buttons-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
