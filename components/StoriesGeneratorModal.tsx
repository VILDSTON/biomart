'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Copy, Check, Instagram, ExternalLink, RefreshCw, Link2 } from 'lucide-react';
import { Product, StoreSettings } from '@/types';
import { calculateDiscount, formatPrice } from '@/lib/utils';

interface StoriesGeneratorModalProps {
  product: Product | null;
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const StoriesGeneratorModal: React.FC<StoriesGeneratorModalProps> = ({
  product,
  storeSettings,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'dark' | 'gradient' | 'minimal'>('dark');

  const discount = product ? calculateDiscount(product.price, product.old_price) : null;
  const productDirectUrl = product
    ? `https://biomart.vercel.app/${storeSettings.slug}?item=${product.id}`
    : `https://biomart.vercel.app/${storeSettings.slug}`;

  useEffect(() => {
    if (isOpen && product) {
      renderStoriesCard();
    } else {
      setDataUrl(null);
    }
  }, [isOpen, product, activeTheme]);

  const renderStoriesCard = async () => {
    if (!product) return;
    setIsGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Canvas resolution: 1080 x 1920 (Standard 9:16 Instagram Story)
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. Background
    if (activeTheme === 'gradient') {
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#1a0b1e');
      bgGrad.addColorStop(0.5, '#0d0d12');
      bgGrad.addColorStop(1, '#081726');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Radial glowing spheres
      const radial1 = ctx.createRadialGradient(W * 0.2, H * 0.2, 50, W * 0.2, H * 0.2, 500);
      radial1.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
      radial1.addColorStop(1, 'transparent');
      ctx.fillStyle = radial1;
      ctx.fillRect(0, 0, W, H);

      const radial2 = ctx.createRadialGradient(W * 0.8, H * 0.6, 50, W * 0.8, H * 0.6, 600);
      radial2.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      radial2.addColorStop(1, 'transparent');
      ctx.fillStyle = radial2;
      ctx.fillRect(0, 0, W, H);
    } else if (activeTheme === 'minimal') {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, W, H);

      // Clean border accent
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, W - 80, H - 80);
    } else {
      // Dark Modern Luxury (Default)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#0c0d10');
      bgGrad.addColorStop(0.5, '#12141a');
      bgGrad.addColorStop(1, '#090a0d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle ambient glow centered on product
      const glow = ctx.createRadialGradient(W / 2, 750, 100, W / 2, 750, 600);
      glow.addColorStop(0, 'rgba(225, 29, 72, 0.18)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. Top Header Bar: Store Info
    const topBarY = 140;

    // Store Avatar / Monogram Pill
    ctx.save();
    const storePillW = 540;
    const storePillH = 90;
    const storePillX = (W - storePillW) / 2;
    const storePillY = topBarY;

    // Pill background
    roundRect(ctx, storePillX, storePillY, storePillW, storePillH, 45);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Circle avatar inside pill (with photo support & monogram fallback)
    ctx.save();
    ctx.beginPath();
    ctx.arc(storePillX + 45, storePillY + 45, 32, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    let avatarLoaded = false;
    if (storeSettings.avatar_url) {
      try {
        const aImg = await loadImage(storeSettings.avatar_url);
        ctx.drawImage(aImg, storePillX + 13, storePillY + 13, 64, 64);
        avatarLoaded = true;
      } catch (e) {
        // Fallback to monogram
      }
    }

    if (!avatarLoaded) {
      ctx.fillStyle = storeSettings.accent_color || '#e11d48';
      ctx.fillRect(storePillX + 13, storePillY + 13, 64, 64);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((storeSettings.store_name || 'BM').slice(0, 2).toUpperCase(), storePillX + 45, storePillY + 46);
    }
    ctx.restore();

    // Store name inside pill
    ctx.textAlign = 'left';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    const storeTitleText = truncateText(ctx, storeSettings.store_name.toUpperCase(), 340);
    ctx.fillText(storeTitleText, storePillX + 95, storePillY + 45);

    // Verified Check Dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(storePillX + 115 + ctx.measureText(storeTitleText).width, storePillY + 36, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Product Image Card Container
    const imgSize = 720;
    const imgX = (W - imgSize) / 2;
    const imgY = 280;

    // Outer card glow & frame
    ctx.save();
    roundRect(ctx, imgX - 6, imgY - 6, imgSize + 12, imgSize + 12, 44);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Image clipping
    roundRect(ctx, imgX, imgY, imgSize, imgSize, 38);
    ctx.clip();

    // Try loading product image
    const rawImageUrl = product.images?.[0];
    let imageLoaded = false;

    if (rawImageUrl) {
      try {
        const img = await loadImage(rawImageUrl);
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        imageLoaded = true;
      } catch (e) {
        console.warn('Canvas image load failed (CORS/network), using styled fallback', e);
      }
    }

    if (!imageLoaded) {
      // Fallback elegant canvas art
      const fGrad = ctx.createLinearGradient(imgX, imgY, imgX + imgSize, imgY + imgSize);
      fGrad.addColorStop(0, '#26262b');
      fGrad.addColorStop(1, '#18181c');
      ctx.fillStyle = fGrad;
      ctx.fillRect(imgX, imgY, imgSize, imgSize);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '900 64px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BIOMART', imgX + imgSize / 2, imgY + imgSize / 2);
    }
    ctx.restore();

    // Discount badge on top of image
    if (discount !== null) {
      ctx.save();
      const badgeW = 150;
      const badgeH = 64;
      const badgeX = imgX + 30;
      const badgeY = imgY + 30;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
      ctx.fillStyle = '#e11d48';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`-${discount}%`, badgeX + badgeW / 2, badgeY + badgeH / 2 + 2);
      ctx.restore();
    }

    // 4. Product Title (Wrapped)
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const titleLines = wrapText(ctx, product.title, 880);
    let titleY = 1050;
    titleLines.slice(0, 2).forEach((line) => {
      ctx.fillText(line, W / 2, titleY);
      titleY += 62;
    });

    // 5. Price Display
    const priceY = titleY + 25;
    ctx.font = '900 76px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    const priceText = formatPrice(product.price, storeSettings.currency);
    ctx.fillText(priceText, W / 2, priceY);

    if (product.old_price) {
      const oldPriceText = formatPrice(product.old_price, storeSettings.currency);
      ctx.font = '500 40px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#9ca3af';
      const oldY = priceY + 84;
      ctx.fillText(oldPriceText, W / 2, oldY);

      // Strike-through line
      const oldWidth = ctx.measureText(oldPriceText).width;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo((W - oldWidth) / 2 - 10, oldY + 20);
      ctx.lineTo((W + oldWidth) / 2 + 10, oldY + 20);
      ctx.stroke();
    }
    ctx.restore();

    // 6. Sizes / Variants Pill
    if (product.sizes && product.sizes.length > 0) {
      ctx.save();
      const variantStr = `${product.variant_type || 'Размеры'}: ${product.sizes.join('  •  ')}`;
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
      const variantWidth = ctx.measureText(variantStr).width;
      const vPillW = Math.min(variantWidth + 60, 900);
      const vPillH = 56;
      const vPillX = (W - vPillW) / 2;
      const vPillY = 1380;

      roundRect(ctx, vPillX, vPillY, vPillW, vPillH, 28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      ctx.fillStyle = '#d1d5db';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(truncateText(ctx, variantStr, 840), W / 2, vPillY + vPillH / 2);
      ctx.restore();
    }

    // 7. Instagram Stories Interactive Link Sticker Graphic (Iconic)
    const stickerY = 1510;
    const stickerW = 680;
    const stickerH = 130;
    const stickerX = (W - stickerW) / 2;

    ctx.save();
    // Drop shadow under sticker
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;

    // White rounded link sticker
    roundRect(ctx, stickerX, stickerY, stickerW, stickerH, 65);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Sticker Content
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Text inside sticker
    ctx.fillText('ССЫЛКА В ШАПКЕ ПРОФИЛЯ', W / 2, stickerY + stickerH / 2 - 2);

    // Subtle callout
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Нажмите на ссылку, чтобы заказать в 1 клик', W / 2, stickerY + stickerH + 60);
    ctx.restore();

    // 8. Bottom Footer Brand
    ctx.save();
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText(`biomart.vercel.app/${storeSettings.slug}`, W / 2, 1820);
    ctx.restore();

    // Export Data URL
    try {
      const url = canvas.toDataURL('image/png');
      setDataUrl(url);
    } catch (err) {
      console.warn('Canvas export tainted or blocked:', err);
    }
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!dataUrl && canvasRef.current) {
      try {
        const url = canvasRef.current.toDataURL('image/png');
        downloadImage(url);
      } catch (e) {
        console.error(e);
      }
      return;
    }
    if (dataUrl) {
      downloadImage(dataUrl);
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    const safeTitle = (product?.title || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]/gi, '_')
      .slice(0, 25);
    link.download = `stories_${safeTitle}_9x16.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productDirectUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#FFFFFF] border border-[#E7E4DC] rounded-[14px] shadow-lg overflow-hidden flex flex-col max-h-[92vh] z-10 text-[#1A1A1A]">
        {/* Header */}
        <div className="p-4 px-5 border-b border-[#E7E4DC] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-[10px] bg-brand-soft text-brand flex items-center justify-center">
              <Instagram className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] tracking-tight flex items-center gap-1.5">
                <span>Стикер товара для Stories</span>
                <span className="text-[10px] bg-brand-soft text-brand font-mono font-medium px-1.5 py-0.5 rounded-[6px]">9:16</span>
              </h3>
              <p className="text-[11px] text-[#6B6B66]">
                Готовый вертикальный макет 9:16 для Instagram и Telegram
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] bg-[#F7F6F2] hover:bg-[#E7E4DC] text-[#6B6B66] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Left Preview: 9:16 Frame */}
          <div className="sm:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-[210px] aspect-[9/16] rounded-[10px] overflow-hidden shadow-sm border border-[#E7E4DC] bg-[#1A1A1A] group">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Stories preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#6B6B66] p-4 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-brand" />
                  <span className="text-xs font-medium">Генерация макета 9:16...</span>
                </div>
              )}
            </div>

            {/* Hidden canvas element used for rendering */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Right Controls */}
          <div className="sm:col-span-6 space-y-4">
            <div>
              <span className="text-xs font-medium text-[#6B6B66] block mb-2">
                Стиль фона Stories:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTheme('dark')}
                  className={`py-2 px-2 rounded-[10px] text-xs font-medium border transition-colors ${
                    activeTheme === 'dark'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-[#FFFFFF] text-[#6B6B66] border-[#E7E4DC] hover:bg-[#F7F6F2]'
                  }`}
                >
                  Темный
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTheme('gradient')}
                  className={`py-2 px-2 rounded-[10px] text-xs font-medium border transition-colors ${
                    activeTheme === 'gradient'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-[#FFFFFF] text-[#6B6B66] border-[#E7E4DC] hover:bg-[#F7F6F2]'
                  }`}
                >
                  Градиент
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTheme('minimal')}
                  className={`py-2 px-2 rounded-[10px] text-xs font-medium border transition-colors ${
                    activeTheme === 'minimal'
                      ? 'bg-brand text-white border-brand'
                      : 'bg-[#FFFFFF] text-[#6B6B66] border-[#E7E4DC] hover:bg-[#F7F6F2]'
                  }`}
                >
                  Минимал
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#F7F6F2] rounded-[10px] border border-[#E7E4DC] space-y-2">
              <span className="text-[11px] font-medium text-[#1A1A1A] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-brand" />
                <span>Прямая ссылка на этот товар:</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={productDirectUrl}
                  className="flex-1 px-3 py-1.5 bg-[#FFFFFF] border border-[#E7E4DC] rounded-[10px] text-xs font-mono text-[#1A1A1A] truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F7F6F2] text-[#1A1A1A] border border-[#E7E4DC] rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Скопировать ссылку"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-brand" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#6B6B66]">
                Вставьте ссылку в стикер «Ссылка» в Stories — покупатель сразу откроет этот товар.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-[10px] bg-brand hover:bg-brand-hover text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Скачать Stories макет (PNG 1080x1920)</span>
              </button>

              <p className="text-[11px] text-center text-[#6B6B66]">
                Разрешение 1080x1920 (соотношение 9:16) для Instagram и Telegram
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// HELPER DRAWING FUNCTIONS FOR CANVAS
// =========================================================================

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  let truncated = text;
  while (ctx.measureText(truncated).width > maxWidth && truncated.length > 3) {
    truncated = truncated.slice(0, -2);
  }
  return truncated === text ? text : `${truncated}…`;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // If it's a data url or blob, load directly without crossOrigin
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
      return;
    }

    // Try same-origin Next.js image proxy first to avoid CORS canvas taint
    const proxyUrl = `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=85`;
    const imgProxy = new window.Image();
    imgProxy.crossOrigin = 'anonymous';
    imgProxy.onload = () => resolve(imgProxy);
    imgProxy.onerror = () => {
      // Fallback to direct src
      const directImg = new window.Image();
      directImg.crossOrigin = 'anonymous';
      directImg.onload = () => resolve(directImg);
      directImg.onerror = (err) => reject(err);
      directImg.src = src;
    };
    imgProxy.src = proxyUrl;
  });
}
