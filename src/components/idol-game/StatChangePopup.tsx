'use client';

import React, { useEffect, useState } from 'react';

interface StatChanges {
  vocal?: number;
  dance?: number;
  charm?: number;
  mental?: number;
}

interface StatChangePopupProps {
  changes: StatChanges | null;
}

const STAT_LABELS: Record<string, string> = {
  vocal: '보컬',
  dance: '댄스',
  charm: '매력',
  mental: '멘탈',
};

export default function StatChangePopup({ changes }: StatChangePopupProps) {
  const [visible, setVisible] = useState(false);
  const [currentChanges, setCurrentChanges] = useState<StatChanges | null>(null);

  useEffect(() => {
    if (changes) {
      setCurrentChanges(changes);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1800);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [changes]);

  if (!currentChanges) return null;

  const entries = Object.entries(currentChanges).filter(
    ([, val]) => val !== undefined && val !== 0
  ) as [string, number][];

  if (entries.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 16,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        pointerEvents: 'none',
      }}
    >
      {entries.map(([key, val]) => {
        const isPositive = val > 0;
        return (
          <div
            key={key}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              background: isPositive ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)',
              whiteSpace: 'nowrap',
            }}
          >
            {isPositive ? '\u25B2' : '\u25BC'} {STAT_LABELS[key] ?? key}{' '}
            {isPositive ? `+${val}` : val}
          </div>
        );
      })}
    </div>
  );
}
