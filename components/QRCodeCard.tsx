'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import { getStoreUrl, getStoreDisplayUrl } from '@/lib/utils';

interface QRCodeCardProps {
  shopSlug: string;
  storeName: string;
  accentColor?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  shopSlug,
  storeName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  const fullUrl = getStoreUrl(shopSlug);
  const displayUrl = getStoreDisplayUrl(shopSlug);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullUrl,
        {
          width: 160,
          margin: 1.5,
          color: {
            dark: '#1A1A1A',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [fullUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  const handleDownload = () => {
    const printCanvas = document.createElement('canvas');
    QRCode.toCanvas(
      printCanvas,
      fullUrl,
      {
        width: 1024,
        margin: 2,
        color: {
          dark: '#1A1A1A',
          light: '#FFFFFF',
        },
      },
      (err) => {
        if (!err) {
          const link = document.createElement('a');
          link.download = `biomart-${shopSlug}-qr.png`;
          link.href = printCanvas.toDataURL('image/png');
          link.click();
        }
      }
    );
  };

  return (
    <div className="bg-surface border border-border rounded-[14px] p-4 sm:p-5 text-content-primary">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
        {/* Left: QR Code frame */}
        <div className="bg-surface p-2 rounded-[10px] border border-border shrink-0 flex flex-col items-center">
          <canvas ref={canvasRef} className="w-28 h-28 sm:w-32 sm:h-32 rounded-[6px]" />
          <span className="text-[10px] font-mono text-content-secondary mt-1">
            {displayUrl}
          </span>
        </div>

        {/* Right: Info & Actions */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-2.5 w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] bg-brand-soft text-brand text-[11px] font-medium mb-1">
              <span>Прямой адрес витрины</span>
            </div>
            <h3 className="text-sm sm:text-lg font-semibold tracking-tight text-content-primary break-all">
              {fullUrl}
            </h3>
            <p className="text-xs text-content-secondary leading-relaxed mt-0.5">
              Вставьте ссылку в шапку профиля <b>Instagram</b> и распечатайте QR-код для пакетов, визиток и бирок.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center sm:justify-start gap-2 pt-1 w-full">
            <button
              type="button"
              onClick={handleCopy}
              className={`w-full sm:w-auto justify-center px-3.5 py-2 rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-colors ${
                copied
                  ? 'bg-brand-soft text-brand'
                  : 'bg-brand hover:bg-brand-hover text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ссылка скопирована</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопировать для Instagram</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-[10px] text-xs font-medium bg-page hover:bg-surface-soft text-content-primary border border-border flex items-center gap-1.5 transition-colors"
              title="Скачать QR-код высокого разрешения (1024x1024)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать QR-код</span>
            </button>

            <a
              href={`/${shopSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto justify-center px-3 py-2 rounded-[10px] text-xs font-medium text-content-secondary hover:text-content-primary flex items-center gap-1 transition-colors text-center"
            >
              <span>Открыть витрину</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
