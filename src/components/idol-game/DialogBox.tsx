'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ChoiceData } from '@/lib/idol-game/sceneEngine';
import ChoiceButtons from './ChoiceButtons';

interface DialogBoxProps {
  speaker: string;
  text: string;
  choices?: ChoiceData[];
  nextSceneId?: string | null;
  onNext: () => void;
  onChoice: (index: number) => void;
  isResult?: boolean;
  isEnding?: boolean;
}

export default function DialogBox({
  speaker,
  text,
  choices,
  nextSceneId,
  onNext,
  onChoice,
  isResult,
  isEnding,
}: DialogBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  // Reset typing when text changes
  useEffect(() => {
    setDisplayedText('');
    setIsTypingDone(false);
    indexRef.current = 0;

    if (!text) {
      setIsTypingDone(true);
      return;
    }

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      const nextIndex = indexRef.current;
      if (nextIndex >= text.length) {
        setDisplayedText(text);
        setIsTypingDone(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedText(text.slice(0, nextIndex));
      }
    }, 22);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const handleClick = useCallback(() => {
    if (!isTypingDone) {
      // Skip typing, show all text instantly
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedText(text);
      setIsTypingDone(true);
    }
  }, [isTypingDone, text]);

  const hasChoices = choices && choices.length > 0;
  const showNextButton = isTypingDone && !hasChoices && nextSceneId && !isResult && !isEnding;

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        zIndex: 10,
        minHeight: 180,
        background: 'rgba(0,0,0,0.88)',
        borderTop: '1px solid rgba(168,85,247,0.3)',
        padding: '16px 20px',
        color: '#fff',
        cursor: !isTypingDone ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Speaker name */}
      {speaker && (
        <div style={{ color: '#a855f7', fontWeight: 700, fontSize: 15 }}>{speaker}</div>
      )}

      {/* Text */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          minHeight: 48,
          flex: 1,
        }}
      >
        {displayedText}
        {!isTypingDone && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 14,
              background: '#a855f7',
              marginLeft: 2,
              animation: 'blink 0.8s steps(2) infinite',
            }}
          />
        )}
      </div>

      {/* Choices */}
      {isTypingDone && hasChoices && (
        <ChoiceButtons choices={choices} onChoice={onChoice} />
      )}

      {/* Next button */}
      {showNextButton && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 14px',
              background: 'rgba(168,85,247,0.25)',
              border: '1px solid rgba(168,85,247,0.5)',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.25)';
            }}
          >
            다음
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Blinking cursor animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
