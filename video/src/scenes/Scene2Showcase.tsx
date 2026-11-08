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
import { Sparkles, ShieldCheck, ShoppingBag, Check, Zap } from 'lucide-react';
import { BioMartLogo } from '../components/BioMartLogo';

export const Scene2Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro spring
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Phone entrance
  const phoneSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 95 },
  });

  // Features staggered
  const feat1 = spring({ frame: frame - 60, fps, config: { damping: 12, stiffness: 120 } });
  const feat2 = spring({ frame: frame - 100, fps, config: { damping: 12, stiffness: 120 } });

  // Size selected state at frame 130
  const isSizeSelected = frame >= 130;
  // Cart clicked state at frame 180
  const isCartAdded = frame >= 180;

  // Floating bounce on phone
  const floatY = Math.sin(frame / 12) * 8;

  // Exit transition (duration 295 frames)
  const exitOpacity = interpolate(frame, [270, 295], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [270, 295], [1, 0.95], {
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
        padding: '50px 30px',
        opacity: exitOpacity,
        scale: exitScale,
      }}
    >
      {/* Audio: Voiceover */}
      <Audio src={staticFile('voice_scene2.mp3')} volume={1.0} />

      {/* SFX: Phone Entrance Whoosh */}
      <Sequence from={10} durationInFrames={30}>
        <Audio src={staticFile('sfx_whoosh.wav')} volume={0.65} />
      </Sequence>

      {/* SFX: Size Selected Pop */}
      <Sequence from={130} durationInFrames={30}>
        <Audio src={staticFile('sfx_pop.wav')} volume={0.6} />
      </Sequence>

      {/* SFX: Added to Cart Success Chime */}
      <Sequence from={180} durationInFrames={40}>
        <Audio src={staticFile('sfx_success.wav')} volume={0.7} />
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
          marginBottom: '22px',
          boxShadow: '0 8px 28px rgba(16, 185, 129, 0.22)',
        }}
      >
        <Sparkles size={28} />
        <span>Готовое решение за 2 минуты</span>
      </div>

      {/* Main Headline */}
      <h1
        style={{
          opacity: introSpring,
          transform: `translateY(${interpolate(introSpring, [0, 1], [25, 0])}px)`,
          fontSize: '64px',
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          marginBottom: '35px',
          maxWidth: '920px',
        }}
      >
        Умная витрина для вашего магазина
      </h1>

      {/* Center Phone Mockup */}
      <div
        style={{
          opacity: phoneSpring,
          transform: `translateY(${interpolate(phoneSpring, [0, 1], [60, 0]) + floatY}px) scale(${phoneSpring})`,
          width: '560px',
          backgroundColor: '#0f172a',
          borderRadius: '52px',
          border: '6px solid #1e293b',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 50px rgba(16, 185, 129, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Dynamic Island / Speaker */}
        <div
          style={{
            height: '36px',
            backgroundColor: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '20px',
              backgroundColor: '#1b2333',
              borderRadius: '999px',
            }}
          />
        </div>

        {/* Storefront Header */}
        <div
          style={{
            padding: '24px 28px',
            backgroundColor: '#141e33',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BioMartLogo size={34} color="#10b981" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>
                  Tashkent Drip
                </span>
                <ShieldCheck size={22} color="#10b981" />
              </div>
              <span style={{ fontSize: '18px', color: '#94a3b8' }}>Официальный магазин</span>
            </div>
          </div>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            Открыто
          </div>
        </div>

        {/* Product Card Inside Phone */}
        <div style={{ padding: '26px' }}>
          {/* Product Image Box */}
          <div
            style={{
              width: '100%',
              height: '320px',
              borderRadius: '28px',
              backgroundColor: '#1b263b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                position: 'absolute',
              }}
            />
            <ShoppingBag size={100} color="#34d399" />
            <div
              style={{
                marginTop: '12px',
                fontSize: '20px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '1px',
              }}
            >
              PREMIUM HOODIE
            </div>
            <div
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              HIT
            </div>
          </div>

          {/* Product Info */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
                Oversize Hoodie Emerald
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#10b981' }}>
                390 000 сум
              </div>
            </div>
            <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '6px' }}>
              Плотный хлопок 420g • Ограниченный дроп
            </div>

            {/* Size selector buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
              {['S', 'M', 'L', 'XL'].map((s) => {
                const isSelected = s === 'L' && isSizeSelected;
                return (
                  <div
                    key={s}
                    style={{
                      flex: 1,
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? '#10b981' : '#1e293b',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '18px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.5)' : 'none',
                    }}
                  >
                    {s}
                  </div>
                );
              })}
            </div>

            {/* Add to Cart CTA inside phone */}
            <div
              style={{
                marginTop: '22px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: isCartAdded ? '#059669' : '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: '#ffffff',
                fontSize: '22px',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              }}
            >
              {isCartAdded ? (
                <>
                  <Check size={26} strokeWidth={3} />
                  <span>Добавлено в корзину!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={24} />
                  <span>В корзину • 390 000 сум</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating feature pills on the sides */}
      {frame >= 60 && (
        <div
          style={{
            position: 'absolute',
            left: '60px',
            bottom: '260px',
            opacity: feat1,
            transform: `translateX(${interpolate(feat1, [0, 1], [-40, 0])}px)`,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '20px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Zap size={28} color="#34d399" />
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#f3f4f6' }}>
            Быстрая загрузка
          </span>
        </div>
      )}

      {frame >= 100 && (
        <div
          style={{
            position: 'absolute',
            right: '60px',
            bottom: '260px',
            opacity: feat2,
            transform: `translateX(${interpolate(feat2, [0, 1], [40, 0])}px)`,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '20px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Check size={28} color="#34d399" />
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#f3f4f6' }}>
            Оформление в 2 клика
          </span>
        </div>
      )}
    </div>
  );
};
