'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, ArrowRight, Store } from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';
import { IS_SUBSCRIPTION_ENABLED } from '@/lib/constants';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleTheme,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled
          ? 'h-14 bg-surface/85 backdrop-blur-md border-b border-border shadow-[0_2px_12px_rgba(26,26,26,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
          : 'h-16 bg-page/90 backdrop-blur-xs border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 font-bold text-lg sm:text-xl text-content-primary shrink-0 transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          <BioMartLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" color="#1F7A5A" />
          <span className="tracking-tight">BioMart</span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-content-secondary">
          <a
            href="#features"
            className="hover:text-content-primary transition-colors cursor-pointer"
          >
            Возможности
          </a>
          <a
            href="#calculator"
            className="hover:text-content-primary transition-colors cursor-pointer"
          >
            Калькулятор
          </a>
          {IS_SUBSCRIPTION_ENABLED && (
            <a
              href="#pricing"
              className="hover:text-content-primary transition-colors cursor-pointer"
            >
              Тарифы
            </a>
          )}
          <a
            href="#faq"
            className="hover:text-content-primary transition-colors cursor-pointer"
          >
            FAQ
          </a>
          <Link
            href="/demo"
            className="text-accent hover:text-accent-hover font-semibold transition-colors"
          >
            Демо
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-[10px] border border-border bg-surface hover:bg-surface-soft text-content-secondary hover:text-content-primary flex items-center justify-center transition-all active:scale-[0.97]"
            title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            aria-label="Переключить тему"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-content-secondary" />
            )}
          </button>

          {/* Login Link */}
          <Link
            href="/login"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-[10px] text-xs font-semibold text-content-secondary hover:text-content-primary hover:bg-surface-soft transition-colors"
          >
            Войти
          </Link>

          {/* Primary Register CTA */}
          <Link
            href="/register"
            className="px-3.5 sm:px-4 py-2 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_2px_8px_rgba(31,122,90,0.25)] active:scale-[0.97]"
          >
            <span>Создать витрину</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
