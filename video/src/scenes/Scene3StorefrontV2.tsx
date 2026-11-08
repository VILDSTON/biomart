import React from 'react';
import {
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const Scene3StorefrontV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro
  const introSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const phoneSpring = spring({ frame: frame - 12, fps, config: { damping: 15, stiffness: 100 } });

  // Size selected at frame 70
  const isSizeL = frame >= 70;
  // Button click state at frame 110
  const isClicked = frame >= 110;
  const buttonScale = isClicked
    ? interpolate(frame, [110, 116, 124], [1, 0.94, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  // Exit transition
  const exitOpacity = interpolate(frame, [180, 195], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = interpolate(frame, [180, 195], [0, -30], {
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
        paddingTop: '270px', // Safe zone: 270px from top
        paddingLeft: '60px',
        paddingRight: '130px', // Safe zone: >120px from right
        opacity: exitOpacity,
        transform: `translateY(${exitY}px)`,
      }}
    >
      {/* Audio: Scene 3 Voiceover (ElevenLabs) */}
      <Audio src={staticFile('voice_eleven/scene3.mp3')} volume={1.0} />

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
          marginBottom: '36px',
        }}
      >
        Сделайте витрину в <span style={{ color: '#1F7A5A' }}>BioMart</span>
      </h1>

      {/* Real Phone Card Mockup (390 x 780 equivalent) */}
      <div
        style={{
          opacity: phoneSpring,
          transform: `translateY(${interpolate(phoneSpring, [0, 1], [40, 0])}px)`,
          width: '580px',
          backgroundColor: '#FFFFFF',
          borderRadius: '36px',
          border: '2px solid #E5E2DA',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Store Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#1A1A1A' }}>
              TASHKENT DRIP
            </span>
            <span style={{ color: '#1F7A5A', fontSize: '22px' }}>✓</span>
          </div>
          <span style={{ fontSize: '18px', color: '#1F7A5A', fontWeight: 600 }}>
            Витрина магазина
          </span>
        </div>

        {/* Real Product Photo */}
        <div
          style={{
            width: '100%',
            height: '280px',
            backgroundColor: '#EDEBE6',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('hoodie_photo.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Product Details */}
        <div style={{ padding: '24px 28px' }}>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#1A1A1A',
              lineHeight: 1.25,
            }}
          >
            Худи Oversize Tashkent Underground
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#1F7A5A',
              marginTop: '8px',
            }}
          >
            320 000 сум
          </div>

          {/* Size Selector */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '18px', color: '#666666', marginBottom: '8px' }}>
              Размер:
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['S', 'M', 'L', 'XL'].map((size) => {
                const isSelected = size === 'L' && isSizeL;
                return (
                  <div
                    key={size}
                    style={{
                      flex: 1,
                      height: '46px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #1F7A5A' : '1.5px solid #D8D5CC',
                      backgroundColor: isSelected ? '#1F7A5A' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#1A1A1A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 700,
                    }}
                  >
                    {size}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button: Заказать */}
          <div
            style={{
              marginTop: '22px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: isClicked ? '#165D44' : '#1F7A5A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 700,
              transform: `scale(${buttonScale})`,
              boxShadow: '0 4px 14px rgba(31, 122, 90, 0.25)',
            }}
          >
            {isClicked ? 'Заказ оформлен ✓' : 'Заказать'}
          </div>
        </div>
      </div>
    </div>
  );
};
