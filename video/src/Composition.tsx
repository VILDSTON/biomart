import React from 'react';
import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';
import { BackgroundV2 } from './components/BackgroundV2';
import { SubtitlesV2 } from './components/SubtitlesV2';
import { SubtitlesUz } from './components/SubtitlesUz';
import { Scene1PainV2 } from './scenes/Scene1PainV2';
import { Scene2ChatV2 } from './scenes/Scene2ChatV2';
import { Scene3StorefrontV2 } from './scenes/Scene3StorefrontV2';
import { Scene4TelegramV2 } from './scenes/Scene4TelegramV2';
import { Scene5CTAV2 } from './scenes/Scene5CTAV2';

import { Scene1PainUz } from './scenes/uz/Scene1PainUz';
import { Scene2ChatUz } from './scenes/uz/Scene2ChatUz';
import { Scene3StorefrontUz } from './scenes/uz/Scene3StorefrontUz';
import { Scene4TelegramUz } from './scenes/uz/Scene4TelegramUz';
import { Scene5CTAUz } from './scenes/uz/Scene5CTAUz';

export const BioMartAdVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        fontFamily:
          'Onest, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#1A1A1A',
        backgroundColor: '#F7F6F2',
      }}
    >
      {/* Clean Solid Background */}
      <BackgroundV2 />

      {/* Gentle Lo-Fi Ambient Bed (-22 dB under voice) */}
      <Audio src={staticFile('bg_music.wav')} volume={0.07} />

      {/* 5 Sequential Scenes (720 frames total = 24.0s @ 30 fps) */}
      <Series>
        {/* Scene 1: Pain Intro (96 frames / 3.2s) */}
        <Series.Sequence durationInFrames={96}>
          <Scene1PainV2 />
        </Series.Sequence>

        {/* Scene 2: Direct Chat Flood (189 frames / 6.3s) */}
        <Series.Sequence durationInFrames={189}>
          <Scene2ChatV2 />
        </Series.Sequence>

        {/* Scene 3: Storefront Solution (180 frames / 6.0s) */}
        <Series.Sequence durationInFrames={180}>
          <Scene3StorefrontV2 />
        </Series.Sequence>

        {/* Scene 4: Telegram Notification (90 frames / 3.0s) */}
        <Series.Sequence durationInFrames={90}>
          <Scene4TelegramV2 />
        </Series.Sequence>

        {/* Scene 5: Grand Finale CTA (165 frames / 5.5s) */}
        <Series.Sequence durationInFrames={165}>
          <Scene5CTAV2 />
        </Series.Sequence>
      </Series>

      {/* Contrast Subtitles in Safe Zone */}
      <SubtitlesV2 />
    </AbsoluteFill>
  );
};

export const BioMartAdUzbekVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        fontFamily:
          'Onest, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#1A1A1A',
        backgroundColor: '#F7F6F2',
      }}
    >
      {/* Clean Solid Background */}
      <BackgroundV2 />

      {/* Gentle Lo-Fi Ambient Bed (-22 dB under voice) */}
      <Audio src={staticFile('bg_music.wav')} volume={0.07} />

      {/* 5 Sequential Scenes (720 frames total = 24.0s @ 30 fps) */}
      <Series>
        {/* Scene 1: 135 frames (4.5s) */}
        <Series.Sequence durationInFrames={135}>
          <Scene1PainUz />
        </Series.Sequence>

        {/* Scene 2: 175 frames (5.83s) */}
        <Series.Sequence durationInFrames={175}>
          <Scene2ChatUz />
        </Series.Sequence>

        {/* Scene 3: 205 frames (6.83s) */}
        <Series.Sequence durationInFrames={205}>
          <Scene3StorefrontUz />
        </Series.Sequence>

        {/* Scene 4: 90 frames (3.0s) */}
        <Series.Sequence durationInFrames={90}>
          <Scene4TelegramUz />
        </Series.Sequence>

        {/* Scene 5: 115 frames (3.83s) */}
        <Series.Sequence durationInFrames={115}>
          <Scene5CTAUz />
        </Series.Sequence>
      </Series>

      {/* Contrast Subtitles in Safe Zone */}
      <SubtitlesUz />
    </AbsoluteFill>
  );
};

export const MyComposition: React.FC = () => {
  const TOTAL_DURATION = 720; // 24.0 seconds @ 30 fps

  return (
    <>
      {/* Russian - 9:16 Vertical format for Instagram Reels (1080x1920) */}
      <Composition
        id="BioMartAd-Reels"
        component={BioMartAdVideo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Russian - 16:9 Landscape format (1920x1080) */}
      <Composition
        id="BioMartAd-Landscape"
        component={BioMartAdVideo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Uzbek - 9:16 Vertical format for Instagram Reels (1080x1920) */}
      <Composition
        id="BioMartAd-Uzbek"
        component={BioMartAdUzbekVideo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
