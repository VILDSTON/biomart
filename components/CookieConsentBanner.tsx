'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, ShieldCheck } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      // Check if force query param is present e.g. ?cookies
      const urlParams = new URLSearchParams(window.location.search);
      const forceShow = urlParams.has('cookies') || urlParams.has('cookie');

      const consent = localStorage.getItem('biomart_cookie_consent');
      if (!consent || forceShow) {
        // Show promptly after hydration without long annoying delay
        const timer = setTimeout(() => setIsVisible(true), 150);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  // Listen for custom trigger from footer "Настройки Cookie"
  useEffect(() => {
    const handleTrigger = () => setIsVisible(true);
    window.addEventListener('biomart_show_cookie_banner', handleTrigger);
    return () => window.removeEventListener('biomart_show_cookie_banner', handleTrigger);
  }, []);

  const handleAccept = (type: 'all' | 'necessary') => {
    try {
      localStorage.setItem('biomart_cookie_consent', type);
      localStorage.setItem('biomart_cookie_date', new Date().toISOString());
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Согласие на использование файлов cookie"
      className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-[9999] sm:max-w-md bg-surface dark:bg-[#1E1E1E] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl p-4 sm:p-5 animate-smooth-in"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-accent" />
          </div>
          <div>
            <span className="text-xs font-bold text-content-primary block">
              Мы используем файлы cookie
            </span>
            <span className="text-[10px] text-content-tertiary">
              Для корзины, быстрой авторизации и аналитики
            </span>
          </div>
        </div>
        <button
          onClick={() => handleAccept('necessary')}
          title="Закрыть"
          className="p-1 text-content-secondary hover:text-content-primary rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-content-secondary leading-relaxed mb-4">
        BioMart использует cookies для стабильной работы онлайн-витрины, сохранения корзины и безопасного оформления заказов через Telegram в соответствии с законодательством Республики Узбекистан.{' '}
        <Link href="/privacy" className="text-accent hover:underline font-semibold">
          Политика конфиденциальности
        </Link>
        .
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAccept('all')}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-accent text-white hover:brightness-105 active:scale-95 transition-all shadow-xs text-center"
        >
          Принять все
        </button>
        <button
          onClick={() => handleAccept('necessary')}
          className="py-2 px-3 rounded-lg text-xs font-semibold bg-page hover:bg-surface border border-border text-content-secondary hover:text-content-primary transition-colors text-center"
        >
          Только обязательные
        </button>
      </div>
    </aside>
  );
};
