'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getBgUrl, handleBgImageError, getBgGradient } from '@/lib/idol-game/sceneEngine';

interface SceneRendererProps {
  bgKey: string;
  spotlight?: boolean;
  isTransitioning: boolean;
}

export default function SceneRenderer({ bgKey, spotlight, isTransitioning }: SceneRendererProps) {
  const [layerA, setLayerA] = useState<string>(bgKey);
  const [layerB, setLayerB] = useState<string>('');
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const prevBgKey = useRef(bgKey);

  useEffect(() => {
    if (bgKey !== prevBgKey.current) {
      // Crossfade: set the inactive layer to the new bg, then swap
      if (activeLayer === 'A') {
        setLayerB(bgKey);
        setActiveLayer('B');
      } else {
        setLayerA(bgKey);
        setActiveLayer('A');
      }
      prevBgKey.current = bgKey;
    }
  }, [bgKey, activeLayer]);

  const layerStyle = (isActive: boolean): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.6s ease',
    opacity: isActive ? 1 : 0,
    zIndex: 0,
  });

  return (
    <>
      {/* CSS gradient fallback */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: getBgGradient(bgKey),
          zIndex: 0,
        }}
      />
      {/* Layer A */}
      {layerA && (
        <img
          key={`layer-a-${layerA}`}
          src={getBgUrl(layerA)}
          onError={(e) => handleBgImageError(e, layerA)}
          alt=""
          style={layerStyle(activeLayer === 'A')}
          draggable={false}
        />
      )}

      {/* Layer B */}
      {layerB && (
        <img
          key={`layer-b-${layerB}`}
          src={getBgUrl(layerB)}
          onError={(e) => handleBgImageError(e, layerB)}
          alt=""
          style={layerStyle(activeLayer === 'B')}
          draggable={false}
        />
      )}

      {/* Transition overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          opacity: isTransitioning ? 1 : 0,
          transition: 'opacity 0.35s ease',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Spotlight overlay */}
      {spotlight && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at top center, rgba(255,255,255,0.3) 0%, transparent 60%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}
