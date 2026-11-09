import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Home, Store, ArrowRight, Search, Sparkles, AlertCircle } from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export const metadata: Metadata = {
  title: '404 — Страница не найдена | BioMart',
  description: 'Запрашиваемая страница не существует или магазин изменил адрес.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-page text-content-primary flex flex-col justify-between selection:bg-accent/20">
      {/* Top Navbar */}
      <header className="w-full border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <BioMartLogo size={28} withText textClassName="text-base sm:text-lg font-bold tracking-tight text-content-primary" />
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/demo"
              className="text-xs font-semibold text-content-secondary hover:text-content-primary px-3 py-1.5 rounded-btn transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Примеры витрин</span>
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Создать витрину</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-lg mx-auto text-center space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-bold tracking-wide">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>ОШИБКА 404</span>
          </div>

          {/* Clean 404 Headline */}
          <div className="space-y-3">
            <div className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-content-primary font-mono select-none">
              404
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-content-primary">
              Страница не найдена или магазин переехал
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
              Возможно, адрес введен с опечаткой, ссылка в Instagram устарела или продавец изменил свой никнейм.
            </p>
          </div>

          {/* Direct Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-md mx-auto">
            <Link
              href="/"
              className="w-full sm:w-auto flex-1 min-h-[44px] px-5 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span>На главную BioMart</span>
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto flex-1 min-h-[44px] px-5 py-2.5 rounded-btn bg-surface hover:bg-page border border-border text-content-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-[0.98]"
            >
              <Store className="w-4 h-4 text-accent" />
              <span>Примеры витрин</span>
            </Link>
          </div>

          {/* Helpful Navigation Card */}
          <div className="pt-2 max-w-md mx-auto">
            <div className="p-4 sm:p-5 rounded-card bg-surface border border-border shadow-2xs text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-content-primary">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Полезные разделы:</span>
              </div>
              <ul className="divide-y divide-border/60 text-xs">
                <li>
                  <Link
                    href="/register"
                    className="py-2.5 flex items-center justify-between group text-content-secondary hover:text-content-primary transition-colors"
                  >
                    <span>Открыть свою витрину бесплатно</span>
                    <ArrowRight className="w-3.5 h-3.5 text-content-secondary/60 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="py-2.5 flex items-center justify-between group text-content-secondary hover:text-content-primary transition-colors"
                  >
                    <span>Вход в панель управления продавца</span>
                    <ArrowRight className="w-3.5 h-3.5 text-content-secondary/60 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rules"
                    className="py-2.5 flex items-center justify-between group text-content-secondary hover:text-content-primary transition-colors"
                  >
                    <span>Правила платформы и модерация</span>
                    <ArrowRight className="w-3.5 h-3.5 text-content-secondary/60 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border py-4 text-center text-[11px] text-content-secondary">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} BioMart.uz — Платформа витрин для малого бизнеса</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-content-primary transition-colors">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="hover:text-content-primary transition-colors">
              Условия
            </Link>
            <Link href="/rules" className="hover:text-content-primary transition-colors">
              Правила
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
