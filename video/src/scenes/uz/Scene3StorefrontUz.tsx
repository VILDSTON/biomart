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

export const Scene3StorefrontUz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const phoneSpring = spring({ frame: frame - 12, fps, config: { damping: 15, stiffness: 100 } });

  const isSizeL = frame >= 70;
  const isClicked = frame >= 110;
  const buttonScale = isClicked
    ? interpolate(frame, [110, 116, 124], [1, 0.94, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const exitOpacity = interpolate(frame, [190, 205], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = interpolate(frame, [190, 205], [0, -30], {
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
        paddingTop: '270px',
        paddingLeft: '60px',
        paddingRight: '130px',
        opacity: exitOpacity,
        transform: `translateY(${exitY}px)`,
      }}
    >
      <Audio src={staticFile('voice_uz/scene3.mp3')} volume={1.0} />

      <h1
        style={{
          opacity: introSpring,
          transform: `translateY(${interpolate(introSpring, [0, 1], [25, 0])}px)`,
          fontSize: '78px',
          fontWeight: 800,
          color: '#1A1A1A',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          margin: 0,
          marginBottom: '36px',
        }}
      >
        BioMart-da <span style={{ color: '#1F7A5A' }}>vitrina oching</span>
      </h1>

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
            Do‘kon vitrinasi
          </span>
        </div>

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

        <div style={{ padding: '24px 28px' }}>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#1A1A1A',
              lineHeight: 1.25,
            }}
          >
            Xudi Oversize Tashkent Underground
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#1F7A5A',
              marginTop: '8px',
            }}
          >
            320 000 so‘m
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '18px', color: '#666666', marginBottom: '8px' }}>
              O‘lcham:
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
            {isClicked ? 'Buyurtma berildi ✓' : 'Buyurtma berish'}
          </div>
        </div>
      </div>
    </div>
  );
};
