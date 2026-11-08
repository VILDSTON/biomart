import React from 'react';
import {
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BioMartLogo } from '../../components/BioMartLogo';

export const Scene5CTAUz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const introSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const brandSpring = spring({ frame: frame - 12, fps, config: { damping: 15, stiffness: 100 } });
  const subSpring = spring({ frame: frame - 24, fps, config: { damping: 15, stiffness: 100 } });
  const ctaSpring = spring({ frame: frame - 36, fps, config: { damping: 15, stiffness: 100 } });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '60px',
        paddingRight: '130px', // Safe zone: >120px from right
      }}
    >
      {/* Audio: Scene 5 Voiceover (ElevenLabs Uzbek) */}
      <Audio src={staticFile('voice_uz/scene5.mp3')} volume={1.0} />

      {/* Large Headline */}
      <h1
        style={{
          opacity: introSpring,
          transform: `translateY(${interpolate(introSpring, [0, 1], [30, 0])}px)`,
          fontSize: '96px',
          fontWeight: 800,
          color: '#1A1A1A',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-2px',
          margin: 0,
          marginBottom: '36px',
          maxWidth: '880px',
        }}
      >
        Bepul.
      </h1>

      {/* Brand Logo & Name (NO URL!) */}
      <div
        style={{
          opacity: brandSpring,
          transform: `translateY(${interpolate(brandSpring, [0, 1], [25, 0])}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '30px',
        }}
      >
        <BioMartLogo size={140} color="#1F7A5A" />
        <span
          style={{
            fontSize: '110px',
            fontWeight: 800,
            color: '#1F7A5A',
            letterSpacing: '-2px',
          }}
        >
          BioMart
        </span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subSpring,
          transform: `translateY(${interpolate(subSpring, [0, 1], [20, 0])}px)`,
          fontSize: '52px',
          fontWeight: 600,
          color: '#666666',
          marginBottom: '60px',
        }}
      >
        Havola profil sarlavhasida
      </div>

      {/* Clean Flat CTA Button */}
      <div
        style={{
          opacity: ctaSpring,
          transform: `translateY(${interpolate(ctaSpring, [0, 1], [30, 0])}px)`,
          backgroundColor: '#1F7A5A',
          borderRadius: '24px',
          padding: '24px 56px',
          color: '#FFFFFF',
          fontSize: '44px',
          fontWeight: 700,
          boxShadow: '0 10px 30px rgba(31, 122, 90, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <span>Vitrina yaratish</span>
        <span style={{ fontSize: '48px' }}>→</span>
      </div>
    </div>
  );
};
