'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, ShieldCheck } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('biomart_cookie_consent');
      if (!consent) {
        // Show after 1.5 seconds delay for a smooth experience
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
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
      className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-md bg-surface/95 dark:bg-surface/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 sm:p-5 animate-smooth-in"
      style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-content-primary">
            Мы заботимся о вашей конфиденциальности
          </span>
        </div>
        <button
          onClick={() => handleAccept('necessary')}
          title="Закрыть"
          className="p-1 text-content-secondary hover:text-content-primary rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-content-secondary leading-relaxed mb-4">
        BioMart использует файлы cookie для корректной работы корзины, безопасной авторизации и улучшения работы витрин в соответствии с законодательством Республики Узбекистан.{' '}
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
          Только нужные
        </button>
      </div>
    </aside>
  );
};
