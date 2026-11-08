import React from 'react';
import {
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const Scene2ChatV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for bubbles
  const b1 = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
  const b2 = spring({ frame: frame - 28, fps, config: { damping: 14, stiffness: 120 } });
  const b3 = spring({ frame: frame - 52, fps, config: { damping: 14, stiffness: 120 } });
  const b4 = spring({ frame: frame - 76, fps, config: { damping: 14, stiffness: 120 } });

  // Callout warning entrance
  const alertSpring = spring({ frame: frame - 104, fps, config: { damping: 14, stiffness: 110 } });

  // Exit transition
  const exitOpacity = interpolate(frame, [160, 174], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = interpolate(frame, [160, 174], [0, -30], {
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
        paddingTop: '320px', // Safe zone: 320px from top
        paddingLeft: '70px',
        paddingRight: '140px', // Safe zone: >120px from right edge
        opacity: exitOpacity,
        transform: `translateY(${exitY}px)`,
      }}
    >
      {/* Audio: Scene 2 Voiceover (ElevenLabs) */}
      <Audio src={staticFile('voice_eleven/scene2.mp3')} volume={1.0} />

      {/* Chat Messages Container */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '26px',
        }}
      >
        {/* Bubble 1 */}
        {frame >= 6 && (
          <div
            style={{
              opacity: b1,
              transform: `translateY(${interpolate(b1, [0, 1], [30, 0])}px)`,
              alignSelf: 'flex-start',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E5E2DA',
              borderRadius: '28px 28px 28px 8px',
              padding: '22px 34px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              fontSize: '48px',
              fontWeight: 600,
              color: '#1A1A1A',
            }}
          >
            «Здравствуйте! Сколько стоит?»
          </div>
        )}

        {/* Bubble 2 */}
        {frame >= 28 && (
          <div
            style={{
              opacity: b2,
              transform: `translateY(${interpolate(b2, [0, 1], [30, 0])}px)`,
              alignSelf: 'flex-end',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E5E2DA',
              borderRadius: '28px 28px 8px 28px',
              padding: '22px 34px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              fontSize: '48px',
              fontWeight: 600,
              color: '#1A1A1A',
            }}
          >
            «А есть 42 размер?»
          </div>
        )}

        {/* Bubble 3 */}
        {frame >= 52 && (
          <div
            style={{
              opacity: b3,
              transform: `translateY(${interpolate(b3, [0, 1], [30, 0])}px)`,
              alignSelf: 'flex-start',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E5E2DA',
              borderRadius: '28px 28px 28px 8px',
              padding: '22px 34px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              fontSize: '48px',
              fontWeight: 600,
              color: '#1A1A1A',
            }}
          >
            «Куда скинуть оплату?»
          </div>
        )}

        {/* Bubble 4 */}
        {frame >= 76 && (
          <div
            style={{
              opacity: b4,
              transform: `translateY(${interpolate(b4, [0, 1], [30, 0])}px)`,
              alignSelf: 'flex-end',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E5E2DA',
              borderRadius: '28px 28px 8px 28px',
              padding: '22px 34px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              fontSize: '48px',
              fontWeight: 600,
              color: '#1A1A1A',
            }}
          >
            «Доставка в Самарканд есть?»
          </div>
        )}
      </div>

      {/* Callout Box */}
      {frame >= 104 && (
        <div
          style={{
            marginTop: '50px',
            width: '100%',
            opacity: alertSpring,
            transform: `translateY(${interpolate(alertSpring, [0, 1], [25, 0])}px)`,
            backgroundColor: '#FDECEC',
            border: '2px solid #F5C2C2',
            borderRadius: '26px',
            padding: '28px 36px',
            boxShadow: '0 10px 30px rgba(217, 56, 58, 0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '50px',
              fontWeight: 700,
              color: '#C53030',
              lineHeight: 1.25,
            }}
          >
            Пока ответишь — клиент уже остыл
          </div>
        </div>
      )}
    </div>
  );
};
