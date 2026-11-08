import React from 'react';
import {
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const Scene4TelegramUz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const introSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const cardSpring = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 100 } });

  // Exit transition
  const exitOpacity = interpolate(frame, [78, 88], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = interpolate(frame, [78, 88], [0, -30], {
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
        paddingTop: '280px', // Safe zone: 280px from top
        paddingLeft: '60px',
        paddingRight: '130px', // Safe zone: >120px from right
        opacity: exitOpacity,
        transform: `translateY(${exitY}px)`,
      }}
    >
      {/* Audio: Scene 4 Voiceover (ElevenLabs Uzbek) */}
      <Audio src={staticFile('voice_uz/scene4.mp3')} volume={1.0} />

      {/* Top Headline */}
      <h1
        style={{
          opacity: introSpring,
          transform: `translateY(${interpolate(introSpring, [0, 1], [25, 0])}px)`,
          fontSize: '84px',
          fontWeight: 800,
          color: '#1A1A1A',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          margin: 0,
          marginBottom: '40px',
        }}
      >
        Buyurtma darhol Telegramga keladi
      </h1>

      {/* Telegram Notification Card */}
      <div
        style={{
          opacity: cardSpring,
          transform: `translateY(${interpolate(cardSpring, [0, 1], [40, 0])}px)`,
          width: '680px',
          backgroundColor: '#FFFFFF',
          borderRadius: '32px',
          border: '2px solid #E5E2DA',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Telegram Header */}
        <div
          style={{
            padding: '20px 28px',
            backgroundColor: '#FAF9F6',
            borderBottom: '1.5px solid #E5E2DA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#2AABEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              TG
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1A' }}>
                BioMart Bot
              </div>
              <div style={{ fontSize: '18px', color: '#888888' }}>
                buyurtma bildirishnomasi
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#1F7A5A',
              backgroundColor: '#EDF5F1',
              padding: '6px 14px',
              borderRadius: '999px',
            }}
          >
            Yangi buyurtma #1042
          </span>
        </div>

        {/* Telegram Order Body */}
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '24px', color: '#1A1A1A', fontWeight: 600 }}>
              👤 Xaridor: <span style={{ fontWeight: 700 }}>Sardor Rahimov</span>
            </div>
            <div style={{ fontSize: '24px', color: '#1A1A1A', fontWeight: 600 }}>
              📞 Telefon: <span style={{ fontWeight: 700 }}>+998 90 123-45-67</span>
            </div>
            <div style={{ fontSize: '24px', color: '#1A1A1A', fontWeight: 600 }}>
              🛍️ Mahsulot: <span style={{ fontWeight: 700 }}>1x Xudi Oversize Tashkent Underground (L)</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1.5px solid #EAE7DF',
              }}
            >
              <span style={{ fontSize: '24px', color: '#666666' }}>Jami:</span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#1F7A5A' }}>
                320 000 so‘m
              </span>
            </div>
          </div>

          {/* Map Location Link */}
          <div
            style={{
              marginTop: '22px',
              padding: '16px 20px',
              backgroundColor: '#FAF9F6',
              borderRadius: '16px',
              border: '1.5px solid #E2DFD6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '26px' }}>📍</span>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A' }}>
                  Toshkent sh., Chilonzor
                </div>
                <div style={{ fontSize: '16px', color: '#888888' }}>
                  Yandex Xaritalar nuqtasi
                </div>
              </div>
            </div>
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #D8D4C8',
                fontSize: '18px',
                fontWeight: 700,
                color: '#1A1A1A',
              }}
            >
              Marshrut
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
