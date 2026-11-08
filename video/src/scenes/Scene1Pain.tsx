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
import { MessageSquare, AlertTriangle, ArrowDownRight } from 'lucide-react';

export const Scene1Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for main header
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Staggered springs for message bubbles
  const bubble1 = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const bubble2 = spring({
    frame: frame - 50,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const bubble3 = spring({
    frame: frame - 85,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const bubble4 = spring({
    frame: frame - 120,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Warning card entrance
  const warningSpring = spring({
    frame: frame - 160,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  // Exit fade/scale for scene transition (scene total = 315 frames)
  const exitOpacity = interpolate(frame, [290, 315], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [290, 315], [1, 0.95], {
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
        padding: '60px 40px',
        opacity: exitOpacity,
        scale: exitScale,
      }}
    >
      {/* Audio: Scene Voiceover */}
      <Audio src={staticFile('voice_scene1.mp3')} volume={1.0} />

      {/* Audio: SFX for each popping bubble */}
      <Sequence from={15} durationInFrames={30}>
        <Audio src={staticFile('sfx_pop.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={50} durationInFrames={30}>
        <Audio src={staticFile('sfx_pop.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={85} durationInFrames={30}>
        <Audio src={staticFile('sfx_pop.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={120} durationInFrames={30}>
        <Audio src={staticFile('sfx_pop.wav')} volume={0.65} />
      </Sequence>

      {/* Top Question Tag */}
      <div
        style={{
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [-30, 0])}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 26px',
          borderRadius: '999px',
          backgroundColor: 'rgba(239, 68, 68, 0.14)',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          color: '#f87171',
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '28px',
          boxShadow: '0 8px 28px rgba(239, 68, 68, 0.2)',
        }}
      >
        <AlertTriangle size={30} />
        <span>Продажи в Instagram</span>
      </div>

      {/* Main Punchy Question */}
      <h1
        style={{
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          fontSize: '66px',
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          marginBottom: '50px',
          maxWidth: '920px',
        }}
      >
        Устали от сотен одинаковых вопросов в <span style={{ color: '#f43f5e' }}>Direct</span>?
      </h1>

      {/* Simulated Chat Feed */}
      <div
        style={{
          width: '100%',
          maxWidth: '740px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '50px',
        }}
      >
        {/* Bubble 1 */}
        {frame >= 15 && (
          <div
            style={{
              opacity: bubble1,
              transform: `translateX(${interpolate(bubble1, [0, 1], [-80, 0])}px) scale(${bubble1})`,
              alignSelf: 'flex-start',
              backgroundColor: '#1b202c',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '26px 26px 26px 6px',
              padding: '22px 30px',
              fontSize: '34px',
              fontWeight: 600,
              color: '#f3f4f6',
              boxShadow: '0 14px 34px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <MessageSquare size={32} color="#94a3b8" />
            <span>«Здравствуйте! Сколько стоит?»</span>
          </div>
        )}

        {/* Bubble 2 */}
        {frame >= 50 && (
          <div
            style={{
              opacity: bubble2,
              transform: `translateX(${interpolate(bubble2, [0, 1], [80, 0])}px) scale(${bubble2})`,
              alignSelf: 'flex-end',
              backgroundColor: '#1b202c',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '26px 26px 6px 26px',
              padding: '22px 30px',
              fontSize: '34px',
              fontWeight: 600,
              color: '#f3f4f6',
              boxShadow: '0 14px 34px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span>«А есть в наличии 42 размер?»</span>
          </div>
        )}

        {/* Bubble 3 */}
        {frame >= 85 && (
          <div
            style={{
              opacity: bubble3,
              transform: `translateX(${interpolate(bubble3, [0, 1], [-80, 0])}px) scale(${bubble3})`,
              alignSelf: 'flex-start',
              backgroundColor: '#1b202c',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '26px 26px 26px 6px',
              padding: '22px 30px',
              fontSize: '34px',
              fontWeight: 600,
              color: '#f3f4f6',
              boxShadow: '0 14px 34px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <MessageSquare size={32} color="#94a3b8" />
            <span>«Куда скинуть оплату на карту?»</span>
          </div>
        )}

        {/* Bubble 4 */}
        {frame >= 120 && (
          <div
            style={{
              opacity: bubble4,
              transform: `translateX(${interpolate(bubble4, [0, 1], [80, 0])}px) scale(${bubble4})`,
              alignSelf: 'flex-end',
              backgroundColor: '#1b202c',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '26px 26px 6px 26px',
              padding: '22px 30px',
              fontSize: '34px',
              fontWeight: 600,
              color: '#f3f4f6',
              boxShadow: '0 14px 34px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span>«А доставка в Самарканд есть?»</span>
          </div>
        )}
      </div>

      {/* Alarm Warning Stat */}
      {frame >= 160 && (
        <div
          style={{
            opacity: warningSpring,
            transform: `translateY(${interpolate(warningSpring, [0, 1], [40, 0])}px) scale(${warningSpring})`,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.45)',
            borderRadius: '28px',
            padding: '28px 40px',
            maxWidth: '780px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            boxShadow: '0 18px 45px rgba(239, 68, 68, 0.25)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '22px',
              backgroundColor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <ArrowDownRight size={44} strokeWidth={2.8} />
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#fca5a5' }}>
              До 40% клиентов уходят
            </div>
            <div style={{ fontSize: '26px', color: '#e2e8f0', marginTop: '6px' }}>
              пока продавец отвечает вручную в Direct
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
