'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Store, AlertCircle, Info } from 'lucide-react';
import { useBioMartStore } from '@/store/useStore';
import { BioMartLogo } from '@/components/BioMartLogo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { shops, setActiveSlug } = useBioMartStore();

  const [shopSlug, setShopSlug] = useState('tashkent_drip');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const clean = shopSlug.trim().toLowerCase();
    if (!clean) {
      setErrorMsg('Укажите ссылку или ник магазина');
      return;
    }

    const shop = shops[clean];
    if (!shop && clean !== 'tashkent_drip') {
      setErrorMsg(`Магазин "${clean}" не найден. Проверьте адрес или создайте новый.`);
      return;
    }

    if (password !== 'admin123' && password !== 'admin') {
      setErrorMsg('Неверный пароль. Пароль по умолчанию: admin123');
      return;
    }

    setActiveSlug(clean);
    sessionStorage.setItem('biomart_admin_auth', 'true');
    sessionStorage.setItem('biomart_current_slug', clean);

    router.push('/dashboard');
  };

  // Google OAuth sign-in via Supabase
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        return;
      }

      // Demo fallback if Supabase auth is in mock mode
      const savedSlug = sessionStorage.getItem('biomart_current_slug');
      if (savedSlug && shops[savedSlug]) {
        setActiveSlug(savedSlug);
        sessionStorage.setItem('biomart_admin_auth', 'true');
        router.push('/dashboard');
      } else if (shops['tashkent_drip']) {
        setActiveSlug('tashkent_drip');
        sessionStorage.setItem('biomart_admin_auth', 'true');
        sessionStorage.setItem('biomart_current_slug', 'tashkent_drip');
        router.push('/dashboard');
      } else {
        router.push('/register');
      }
    } catch (err: any) {
      const rawMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err || ''));
      const isProviderNotEnabled =
        rawMsg.includes('Unsupported provider') ||
        rawMsg.includes('provider is not enabled') ||
        rawMsg.includes('validation_failed') ||
        err?.code === 'validation_failed' ||
        err?.error_code === 'validation_failed';

      if (isProviderNotEnabled) {
        setErrorMsg('Google-вход ожидает включения в Supabase Dashboard (Authentication → Providers → Google). Вы можете войти по ссылке магазина или нажать «Демо-магазин» ниже.');
      } else {
        setErrorMsg(err?.message || 'Не удалось войти через Google');
      }
      setIsGoogleLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setActiveSlug('tashkent_drip');
    sessionStorage.setItem('biomart_admin_auth', 'true');
    sessionStorage.setItem('biomart_current_slug', 'tashkent_drip');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[100dvh] bg-page text-content-primary flex flex-col justify-between px-4 py-4">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto pt-2 pb-6 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-[1px] font-bold text-lg sm:text-xl text-content-primary">
          <BioMartLogo className="w-10 h-10 shrink-0" color="#1F7A5A" />
          <span>BioMart</span>
        </Link>

        <Link href="/register" className="text-xs text-content-secondary hover:text-content-primary font-medium">
          Создать витрину →
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto bg-surface border border-border rounded-card p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-content-primary">
            Вход в кабинет продавца
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Управляйте товарами, заказами и привязкой Telegram
          </p>
        </div>

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-btn bg-surface hover:bg-surface-soft border border-border text-content-primary text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 shadow-xs active:scale-[0.99]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Вход через Google...' : 'Продолжить с Google'}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-surface px-3 text-content-secondary">
                или по ссылке магазина
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1">
              Ссылка или ник магазина
            </label>
            <div className="flex items-center rounded-btn bg-page border border-border overflow-hidden focus-within:border-accent">
              <span className="pl-3.5 pr-1 py-2.5 text-xs font-semibold text-content-secondary font-mono select-none">
                /
              </span>
              <input
                type="text"
                required
                value={shopSlug}
                onChange={(e) => setShopSlug(e.target.value)}
                placeholder="vash_magazin"
                className="flex-1 min-w-0 pr-3.5 py-2.5 bg-transparent text-xs text-content-primary font-mono focus:outline-none placeholder:text-content-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1">
              Пароль администратора
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-btn bg-page border border-border text-xs text-content-primary focus:outline-none focus:border-accent font-mono"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-btn bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[44px] py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs"
          >
            <span>Войти в личный кабинет</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full min-h-[40px] py-2 rounded-btn bg-page hover:bg-surface-soft text-content-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-border"
          >
            <Store className="w-3.5 h-3.5 text-accent" />
            <span>Демо-магазин «Tashkent Drip»</span>
          </button>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-content-secondary">
        © BioMart
      </div>
    </div>
  );
}
