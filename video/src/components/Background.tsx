import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const orb1TranslateY = interpolate(frame, [0, 480], [0, 60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const orb2TranslateX = interpolate(frame, [0, 480], [0, -50], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#090a0f',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Subtle Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.7,
        }}
      />

      {/* Floating Emerald Glow Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-20%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(80px)',
          transform: `translateY(${orb1TranslateY}px)`,
        }}
      />

      {/* Floating Teal Glow Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-20%',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
          filter: 'blur(90px)',
          transform: `translateX(${orb2TranslateX}px)`,
        }}
      />

      {/* Center ambient spotlight */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
};
