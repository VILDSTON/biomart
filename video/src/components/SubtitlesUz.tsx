import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface SubtitleItem {
  startFrame: number;
  endFrame: number;
  text: string;
}

const subtitles: SubtitleItem[] = [
  {
    startFrame: 0,
    endFrame: 135,
    text: 'Direct-da «narxi qancha?» deb javob berishdan charchadingizmi?',
  },
  {
    startFrame: 135,
    endFrame: 310,
    text: 'O‘lchami? Yetkazib berish? Qayerga to‘lov qilay?\nSiz javob berguncha xaridor sovib bo‘ladi.',
  },
  {
    startFrame: 310,
    endFrame: 515,
    text: 'BioMart-da o‘z vitrinangizni oching.\nProfil sarlavhasida bitta havola, va xaridor mahsulotni o‘zi tanlaydi.',
  },
  {
    startFrame: 515,
    endFrame: 605,
    text: 'Buyurtma esa darhol Telegramingizga keladi.',
  },
  {
    startFrame: 605,
    endFrame: 720,
    text: 'Bepul.\nBioMart',
  },
];

export const SubtitlesUz: React.FC = () => {
  const frame = useCurrentFrame();

  const current = subtitles.find(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );

  if (!current) return null;

  const fadeIn = interpolate(
    frame,
    [current.startFrame, current.startFrame + 6],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const fadeOut = interpolate(
    frame,
    [current.endFrame - 6, current.endFrame],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '470px', // Strict safe zone: above 450px from bottom!
        left: '60px',
        right: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #E5E2DA',
          borderRadius: '24px',
          padding: '16px 36px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
          maxWidth: '920px',
        }}
      >
        <span
          style={{
            fontSize: '54px',
            fontWeight: 700,
            color: '#1A1A1A',
            lineHeight: 1.25,
            whiteSpace: 'pre-line',
            letterSpacing: '-0.5px',
          }}
        >
          {current.text}
        </span>
      </div>
    </div>
  );
};
