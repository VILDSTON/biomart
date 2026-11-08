import React from 'react';
import {
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

export const Scene1PainUz: React.FC = () => {
  const frame = useCurrentFrame();

  const exitOpacity = interpolate(frame, [125, 135], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = interpolate(frame, [125, 135], [0, -30], {
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
      <Audio src={staticFile('voice_uz/scene1.mp3')} volume={1.0} />

      <h1
        style={{
          fontSize: '84px',
          fontWeight: 800,
          color: '#1A1A1A',
          textAlign: 'center',
          lineHeight: 1.18,
          letterSpacing: '-2px',
          maxWidth: '920px',
          margin: 0,
        }}
      >
        Direct-da <span style={{ color: '#D9383A' }}>«narxi qancha?»</span> deb javob berishdan charchadingizmi?
      </h1>
    </div>
  );
};
