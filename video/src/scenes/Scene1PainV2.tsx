import React from 'react';
import {
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

export const Scene1PainV2: React.FC = () => {
  const frame = useCurrentFrame();

  // Exit transition (at frame 86-96)
  const exitOpacity = interpolate(frame, [86, 96], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = interpolate(frame, [86, 96], [0, -30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
        opacity: exitOpacity,
        transform: `translateY(${exitY}px)`,
      }}
    >
      {/* Audio Voiceover: ElevenLabs */}
      <Audio src={staticFile('voice_eleven/scene1.mp3')} volume={1.0} />

      {/* Main Punch Headline - Visible immediately on frame 0! */}
      <h1
        style={{
          fontSize: '94px',
          fontWeight: 800,
          color: '#1A1A1A',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-2px',
          maxWidth: '920px',
          margin: 0,
        }}
      >
        Сколько можно отвечать{' '}
        <span style={{ color: '#D9383A' }}>«цена?»</span>
      </h1>
    </div>
  );
};
