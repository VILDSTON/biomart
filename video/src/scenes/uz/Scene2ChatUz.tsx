import React from 'react';
import {
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const Scene2ChatUz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const b1 = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
  const b2 = spring({ frame: frame - 28, fps, config: { damping: 14, stiffness: 120 } });
  const b3 = spring({ frame: frame - 52, fps, config: { damping: 14, stiffness: 120 } });
  const b4 = spring({ frame: frame - 76, fps, config: { damping: 14, stiffness: 120 } });

  const alertSpring = spring({ frame: frame - 104, fps, config: { damping: 14, stiffness: 110 } });

  const exitOpacity = interpolate(frame, [160, 175], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = interpolate(frame, [160, 175], [0, -30], {
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
        paddingTop: '320px',
        paddingLeft: '70px',
        paddingRight: '140px',
        opacity: exitOpacity,
        transform: `translateY(${exitY}px)`,
      }}
    >
      <Audio src={staticFile('voice_uz/scene2.mp3')} volume={1.0} />

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '26px',
        }}
      >
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
            «Assalomu alaykum! Narxi qancha?»
          </div>
        )}

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
            «42-o‘lchami bormi?»
          </div>
        )}

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
            «Qayerga to‘lov qilay?»
          </div>
        )}

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
            «Samarqandga yetkazib berish bormi?»
          </div>
        )}
      </div>

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
              fontSize: '48px',
              fontWeight: 700,
              color: '#C53030',
              lineHeight: 1.25,
            }}
          >
            Siz javob berguncha xaridor sovib bo‘ladi
          </div>
        </div>
      )}
    </div>
  );
};
