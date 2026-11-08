import React from 'react';
import {
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Zap, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { BioMartLogo } from '../components/BioMartLogo';

export const Scene4CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Benefit cards staggered
  const card1 = spring({ frame: frame - 15, fps, config: { damping: 13, stiffness: 120 } });
  const card2 = spring({ frame: frame - 30, fps, config: { damping: 13, stiffness: 120 } });
  const card3 = spring({ frame: frame - 45, fps, config: { damping: 13, stiffness: 120 } });

  // Main CTA Box
  const ctaBox = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  // Pulse animation on the CTA button
  const buttonPulse = Math.sin(frame / 6) * 0.03 + 1;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 30px',
      }}
    >
      {/* Audio: Voiceover */}
      <Audio src={staticFile('voice_scene4.mp3')} volume={1.0} />

      {/* SFX: Success Chime */}
      <Sequence from={15} durationInFrames={50}>
        <Audio src={staticFile('sfx_success.wav')} volume={0.8} />
      </Sequence>

      {/* Top Badge */}
      <div
        style={{
          opacity: introSpring,
          transform: `translateY(${interpolate(introSpring, [0, 1], [-25, 0])}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 28px',
          borderRadius: '999px',
          backgroundColor: 'rgba(16, 185, 129, 0.16)',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '24px',
          boxShadow: '0 8px 28px rgba(16, 185, 129, 0.22)',
        }}
      >
        <Sparkles size={28} />
        <span>Начните прямо сейчас</span>
      </div>

      {/* Main Brand Logo & Headline */}
      <div
        style={{
          opacity: introSpring,
          transform: `scale(${introSpring})`,
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '26px',
            backgroundColor: 'rgba(16, 185, 129, 0.18)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.35)',
          }}
        >
          <BioMartLogo size={52} color="#10b981" />
        </div>
        <div style={{ fontSize: '56px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>
          BioMart
        </div>
      </div>

      <h1
        style={{
          opacity: introSpring,
          transform: `translateY(${interpolate(introSpring, [0, 1], [25, 0])}px)`,
          fontSize: '56px',
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.18,
          letterSpacing: '-1px',
          marginBottom: '50px',
          maxWidth: '880px',
        }}
      >
        Автоматизируйте продажи и растите бизнес уже сегодня!
      </h1>

      {/* 3 Metric Cards */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '55px',
          width: '100%',
          maxWidth: '820px',
        }}
      >
        {/* Card 1 */}
        {frame >= 15 && (
          <div
            style={{
              flex: 1,
              opacity: card1,
              transform: `translateY(${interpolate(card1, [0, 1], [30, 0])}px) scale(${card1})`,
              backgroundColor: '#161f30',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '24px',
              padding: '28px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                marginBottom: '16px',
              }}
            >
              <Zap size={32} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff' }}>2 мин</div>
            <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '6px' }}>
              быстрый запуск
            </div>
          </div>
        )}

        {/* Card 2 */}
        {frame >= 30 && (
          <div
            style={{
              flex: 1,
              opacity: card2,
              transform: `translateY(${interpolate(card2, [0, 1], [30, 0])}px) scale(${card2})`,
              backgroundColor: '#161f30',
              border: '1.5px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '24px',
              padding: '28px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                backgroundColor: 'rgba(56, 189, 248, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                marginBottom: '16px',
              }}
            >
              <TrendingUp size={32} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff' }}>+45%</div>
            <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '6px' }}>рост заказов</div>
          </div>
        )}

        {/* Card 3 */}
        {frame >= 45 && (
          <div
            style={{
              flex: 1,
              opacity: card3,
              transform: `translateY(${interpolate(card3, [0, 1], [30, 0])}px) scale(${card3})`,
              backgroundColor: '#161f30',
              border: '1.5px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '24px',
              padding: '28px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                backgroundColor: 'rgba(168, 85, 247, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc',
                marginBottom: '16px',
              }}
            >
              <Clock size={32} />
            </div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff' }}>24/7</div>
            <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '6px' }}>приём заказов</div>
          </div>
        )}
      </div>

      {/* Main CTA Button */}
      {frame >= 60 && (
        <div
          style={{
            opacity: ctaBox,
            transform: `translateY(${interpolate(ctaBox, [0, 1], [40, 0])}px) scale(${ctaBox * buttonPulse})`,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: '#10b981',
            borderRadius: '26px',
            padding: '24px 50px',
            color: '#ffffff',
            boxShadow: '0 16px 45px rgba(16, 185, 129, 0.45)',
          }}
        >
          <BioMartLogo size={36} color="#ffffff" />
          <span style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Создать витрину в BioMart
          </span>
          <ArrowRight size={34} strokeWidth={2.8} />
        </div>
      )}
    </div>
  );
};
