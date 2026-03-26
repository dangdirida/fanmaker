'use client';

import React from 'react';

interface StatBarProps {
  stats: { vocal: number; dance: number; charm: number; mental: number };
  groupName: string;
  stage: string;
  week: number;
}

const STAT_CONFIG = [
  { key: 'vocal' as const, label: '보컬', abbr: '보', color: '#60a5fa' },
  { key: 'dance' as const, label: '댄스', abbr: '댄', color: '#f472b6' },
  { key: 'charm' as const, label: '매력', abbr: '매', color: '#fb923c' },
  { key: 'mental' as const, label: '멘탈', abbr: '멘', color: '#4ade80' },
];

function getStageBadgeStyle(stage: string): React.CSSProperties {
  switch (stage) {
    case '연습생':
      return { background: 'rgba(107,114,128,0.5)', border: '1px solid rgba(107,114,128,0.7)' };
    case '데뷔조':
      return { background: 'rgba(147,51,234,0.4)', border: '1px solid rgba(147,51,234,0.7)' };
    case '신인 아이돌':
      return { background: 'rgba(59,130,246,0.4)', border: '1px solid rgba(59,130,246,0.7)' };
    case '인기 아이돌':
      return { background: 'rgba(236,72,153,0.4)', border: '1px solid rgba(236,72,153,0.7)' };
    case '톱스타':
      return { background: 'rgba(245,158,11,0.4)', border: '1px solid rgba(245,158,11,0.7)' };
    case '레전드':
      return {
        background: 'rgba(0,0,0,0.5)',
        border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #f472b6, #60a5fa, #4ade80, #fb923c, #f472b6) 1',
      };
    default:
      return { background: 'rgba(107,114,128,0.5)', border: '1px solid rgba(107,114,128,0.7)' };
  }
}

export default function StatBar({ stats, groupName, stage, week }: StatBarProps) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 20,
        height: 52,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: 13,
        userSelect: 'none',
      }}
    >
      {/* Left: stats */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0, flex: 1 }}>
        {STAT_CONFIG.map((cfg) => {
          const value = stats[cfg.key];
          return (
            <div key={cfg.key} style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              {/* Desktop: full label + bar */}
              <span className="hidden sm:inline" style={{ color: cfg.color, fontWeight: 600, fontSize: 12 }}>
                {cfg.label}
              </span>
              {/* Mobile: abbreviated label */}
              <span className="sm:hidden" style={{ color: cfg.color, fontWeight: 600, fontSize: 12 }}>
                {cfg.abbr}
              </span>

              <span
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  minWidth: 22,
                  textAlign: 'right',
                  transition: 'all 0.4s ease',
                }}
              >
                {value}
              </span>

              {/* Mini progress bar - desktop only */}
              <div
                className="hidden sm:block"
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.15)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${value}%`,
                    height: '100%',
                    borderRadius: 2,
                    background: cfg.color,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: group name, stage, week */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: 'serif', fontWeight: 700, fontSize: 14 }}>{groupName}</span>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            ...getStageBadgeStyle(stage),
          }}
        >
          {stage}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Week {week}</span>
      </div>
    </div>
  );
}
