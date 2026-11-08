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
import { Send, CheckCircle2, User, Phone, MapPin, Truck, ExternalLink } from 'lucide-react';
import { BioMartLogo } from '../components/BioMartLogo';

export const Scene3TelegramOrder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Telegram card spring entrance
  const cardSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  // Map section spring
  const mapSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Stamp / Done badge
  const stampSpring = spring({
    frame: frame - 110,
    fps,
    config: { damping: 10, stiffness: 140 },
  });

  // Exit transition (duration 230 frames)
  const exitOpacity = interpolate(frame, [205, 230], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [205, 230], [1, 0.95], {
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
      <Audio src={staticFile('voice_scene3.mp3')} volume={1.0} />

      {/* SFX: Telegram Notification Chime */}
      <Sequence from={15} durationInFrames={40}>
        <Audio src={staticFile('sfx_telegram.wav')} volume={0.8} />
      </Sequence>

      {/* Top Telegram Tag */}
      <div
        style={{
          opacity: introSpring,
          transform: `translateY(${interpolate(introSpring, [0, 1], [-25, 0])}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 28px',
          borderRadius: '999px',
          backgroundColor: 'rgba(56, 189, 248, 0.16)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          color: '#38bdf8',
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '22px',
          boxShadow: '0 8px 28px rgba(56, 189, 248, 0.22)',
        }}
      >
        <Send size={28} />
        <span>Уведомления без задержек</span>
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
          marginBottom: '40px',
          maxWidth: '920px',
        }}
      >
        Заказы сразу в вашем <span style={{ color: '#38bdf8' }}>Telegram</span>
      </h1>

      {/* Telegram Notification Card */}
      <div
        style={{
          opacity: cardSpring,
          transform: `translateY(${interpolate(cardSpring, [0, 1], [50, 0])}px) scale(${cardSpring})`,
          width: '720px',
          backgroundColor: '#1b2434',
          borderRadius: '34px',
          border: '2px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Telegram Header */}
        <div
          style={{
            padding: '22px 28px',
            backgroundColor: '#151d2c',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Send size={28} />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>
                BioMart Bot
              </div>
              <div style={{ fontSize: '18px', color: '#38bdf8' }}>bot • только что</div>
            </div>
          </div>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            Новый заказ #1042
          </div>
        </div>

        {/* Message Content */}
        <div style={{ padding: '30px 32px' }}>
          {/* Customer Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <User size={24} color="#94a3b8" />
              <span style={{ fontSize: '24px', color: '#e2e8f0', fontWeight: 600 }}>
                Сардор Рахимов
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Phone size={24} color="#94a3b8" />
              <span style={{ fontSize: '24px', color: '#38bdf8', fontWeight: 700 }}>
                +998 90 123-45-67
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Truck size={24} color="#94a3b8" />
              <span style={{ fontSize: '24px', color: '#e2e8f0' }}>
                1x Oversize Hoodie Emerald (Размер L)
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ fontSize: '22px', color: '#94a3b8' }}>Итого к оплате:</span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#10b981' }}>
                390 000 сум
              </span>
            </div>
          </div>

          {/* Interactive Map Pin Section */}
          {frame >= 60 && (
            <div
              style={{
                marginTop: '24px',
                padding: '20px',
                backgroundColor: '#121824',
                borderRadius: '20px',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: mapSpring,
                transform: `scale(${mapSpring})`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                  }}
                >
                  <MapPin size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
                    Яндекс Карты
                  </div>
                  <div style={{ fontSize: '18px', color: '#94a3b8' }}>
                    г. Ташкент, Чиланзар, 7-й квартал
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                <span>Маршрут</span>
                <ExternalLink size={18} />
              </div>
            </div>
          )}
        </div>

        {/* Status Stamp */}
        {frame >= 110 && (
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              opacity: stampSpring,
              transform: `rotate(-12deg) scale(${stampSpring})`,
              padding: '12px 24px',
              borderRadius: '16px',
              border: '3px solid #10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.18)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
            }}
          >
            <CheckCircle2 size={32} />
            <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '1px' }}>
              ОПЛАЧЕНО
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
