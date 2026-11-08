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
    endFrame: 96,
    text: 'Сколько можно отвечать «цена?» в директе?',
  },
  {
    startFrame: 96,
    endFrame: 285,
    text: 'Размер? Доставка? Куда скинуть оплату?\nПока ответишь, клиент уже остыл.',
  },
  {
    startFrame: 285,
    endFrame: 465,
    text: 'Сделайте витрину в BioMart.\nОдна ссылка в шапке профиля, и клиент сам выбирает товар.',
  },
  {
    startFrame: 465,
    endFrame: 555,
    text: 'А заказ сразу приходит вам в Telegram.',
  },
  {
    startFrame: 555,
    endFrame: 720,
    text: 'Бесплатно. Продавайте проще.\nBioMart',
  },
];

export const SubtitlesV2: React.FC = () => {
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
            fontSize: '56px',
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
