import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
          boxShadow: '0 0 12px rgba(16, 185, 129, 0.8)',
        }}
      />
    </div>
  );
};
