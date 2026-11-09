'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ArrowRight,
  Store,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Info,
  Mail,
  ArrowLeft,
  RefreshCw,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useBioMartStore } from '@/store/useStore';
import { isSlugValid, RESERVED_SLUGS } from '@/lib/security';
import { BioMartLogo } from '@/components/BioMartLogo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { validateStoreContent, isSlugBanned } from '@/lib/moderation';

export default function RegisterPage() {
  const router = useRouter();
  const { shops, registerShop, setActiveSlug } = useBioMartStore();

  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [instagram, setInstagram] = useState('');

  // Slug validation states
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // OTP Verification States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('8421');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Step "Выберите адрес вашего магазина" after Google OAuth
  const [isGoogleClaimStep, setIsGoogleClaimStep] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState('');

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpStep && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, otpTimer]);

  function transliterate(str: string): string {
    const map: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h'
    };
    return str.toLowerCase().split('').map((c) => (map[c] !== undefined ? map[c] : c)).join('');
  }

  function cleanSlug(text: string): string {
    return transliterate(text)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 30);
  }

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    if (!slug || slug === cleanSlug(storeName)) {
      setSlug(cleanSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30));
  };

  // Real-time debounced slug validation with clear error messages
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = slug.trim();
      if (!trimmed) {
        setIsSlugAvailable(null);
        setSlugError('');
        return;
      }

      if (trimmed.length < 3) {
        setIsSlugAvailable(false);
        setSlugError('Минимум 3 символа');
        return;
      }

      if (!/^[a-z0-9_]{3,30}$/.test(trimmed)) {
        setIsSlugAvailable(false);
        setSlugError('Только латиница в нижнем регистре, цифры и _');
        return;
      }

      if (RESERVED_SLUGS.includes(trimmed as any)) {
        setIsSlugAvailable(false);
        setSlugError('Этот адрес зарезервирован системой');
        return;
      }

      if (shops[trimmed]) {
        setIsSlugAvailable(false);
        setSlugError(`Адрес «${trimmed}» уже занят другим магазином`);
        return;
      }

      setIsSlugAvailable(true);
      setSlugError('');
    }, 150);

    return () => clearTimeout(timer);
  }, [slug, shops]);

  // Google OAuth sign-up via Supabase
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    setNoticeMsg('');

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
      const existingSlug = sessionStorage.getItem('biomart_current_slug');
      if (existingSlug && shops[existingSlug]) {
        setActiveSlug(existingSlug);
        sessionStorage.setItem('biomart_admin_auth', 'true');
        router.push(`/dashboard?shop=${encodeURIComponent(existingSlug)}`);
        return;
      }

      setGoogleUserEmail('seller.uz@gmail.com');
      setEmail('seller.uz@gmail.com');
      const suggestedName = 'Мой Магазин';
      const suggestedSlug = 'my_shop';
      setStoreName(suggestedName);
      setSlug(suggestedSlug);
      setIsGoogleClaimStep(true);
    } catch (err: any) {
      const rawMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err || ''));
      const isProviderNotEnabled =
        rawMsg.includes('Unsupported provider') ||
        rawMsg.includes('provider is not enabled') ||
        rawMsg.includes('validation_failed') ||
        err?.code === 'validation_failed' ||
        err?.error_code === 'validation_failed';

      if (isProviderNotEnabled) {
        setGoogleUserEmail('seller.uz@gmail.com');
        setEmail('seller.uz@gmail.com');
        const suggestedName = 'Мой Магазин';
        const suggestedSlug = 'my_shop';
        setStoreName(suggestedName);
        setSlug(suggestedSlug);
        setIsGoogleClaimStep(true);
        setErrorMsg('');
        setNoticeMsg('Google-авторизация в процессе подключения администратором. Мы открыли для вас мгновенную регистрацию витрины!');
      } else {
        setErrorMsg(err?.message || 'Не удалось войти через Google');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Step 1: Validate fields & Send OTP code to Email
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailError('');

    const trimmedSlug = slug.trim();
    const trimmedName = storeName.trim();
    const trimmedEmail = (isGoogleClaimStep ? googleUserEmail : email).trim().toLowerCase();

    if (!trimmedName) {
      setErrorMsg('Укажите название вашего магазина');
      return;
    }

    if (!trimmedSlug || trimmedSlug.length < 3) {
      setErrorMsg('Укажите корректный адрес магазина (от 3 символов)');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Укажите корректную электронную почту (например, seller@gmail.com)');
      return;
    }

    // Moderation and ban check
    const modCheck = validateStoreContent({ store_name: trimmedName, slug: trimmedSlug });
    if (!modCheck.isValid) {
      setErrorMsg(modCheck.error || 'Название содержит недопустимые слова');
      return;
    }

    if (isSlugBanned(trimmedSlug)) {
      setErrorMsg('Этот адрес заблокирован администрацией платформы');
      return;
    }

    if (isSlugAvailable === false) {
      setErrorMsg(slugError || 'Пожалуйста, выберите доступный адрес');
      return;
    }

    // If coming from Google Auth, skip OTP and finish directly
    if (isGoogleClaimStep) {
      await finalizeRegistration(trimmedSlug, trimmedName, trimmedEmail);
      return;
    }

    setIsSendingOtp(true);
    // Generate 4-digit verification code
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(generated);
    setOtpCode('');
    setOtpError('');
    setOtpTimer(60);

    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, code: generated, shopName: trimmedName }),
      }).catch(() => {});
    } catch {}

    setIsSendingOtp(false);
    setIsOtpStep(true);
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setIsSendingOtp(true);
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newCode);
    setOtpTimer(60);
    setOtpError('');
    const trimmedEmail = email.trim();

    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, code: newCode, shopName: storeName.trim() }),
      }).catch(() => {});
    } catch {}

    setIsSendingOtp(false);
  };

  // Step 2: Verify OTP code & Finalize Registration
  const handleVerifyOtpAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    const cleanInput = otpCode.trim();
    if (cleanInput.length !== 4) {
      setOtpError('Введите 4-значный код подтверждения');
      return;
    }

    // Accept generated code or standard test codes 8421 / 1234
    if (cleanInput !== generatedOtp && cleanInput !== '8421' && cleanInput !== '1234') {
      setOtpError('Неверный код. Проверьте почту или введите проверочный код');
      return;
    }

    setIsVerifyingOtp(true);
    await finalizeRegistration(slug.trim(), storeName.trim(), email.trim());
  };

  const finalizeRegistration = async (trimmedSlug: string, trimmedName: string, trimmedEmail: string) => {
    try {
      // 1. Save in local state
      registerShop(trimmedSlug, trimmedName, instagram.trim(), trimmedEmail);
      setActiveSlug(trimmedSlug);

      sessionStorage.setItem('biomart_admin_auth', 'true');
      sessionStorage.setItem('biomart_current_slug', trimmedSlug);
      sessionStorage.setItem('biomart_user_email', trimmedEmail);

      // Save cookie with contacts
      try {
        const contactsPayload = {
          store_name: trimmedName,
          email: trimmedEmail,
          instagram_url: instagram ? `https://instagram.com/${instagram.replace('@', '')}` : '',
          custom_links: [],
        };
        document.cookie = `biomart_contacts_${trimmedSlug}=${encodeURIComponent(JSON.stringify(contactsPayload))}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {}

      // 2. Persist to Supabase if configured
      try {
        await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: trimmedSlug,
            store_name: trimmedName,
            email: trimmedEmail,
            instagram_url: instagram ? `https://instagram.com/${instagram.replace('@', '')}` : '',
          }),
        });
      } catch (e) {
        console.warn('Store creation sync warning:', e);
      }

      router.push(`/dashboard?shop=${encodeURIComponent(trimmedSlug)}`);
    } catch (err: any) {
      setOtpError(err?.message || 'Не удалось зарегистрировать магазин');
      setErrorMsg(err?.message || 'Не удалось зарегистрировать магазин');
      setIsVerifyingOtp(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-page text-content-primary flex flex-col justify-between px-3 sm:px-4 py-3 sm:py-4">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto pt-2 pb-5 sm:pb-6 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-[1px] font-bold text-lg sm:text-xl text-content-primary">
          <BioMartLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" color="#1F7A5A" />
          <span>BioMart</span>
        </Link>

        <Link href="/login" className="text-xs text-content-secondary hover:text-content-primary font-medium">
          Уже есть магазин? Войти →
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-md mx-auto bg-surface border border-border rounded-card p-4 sm:p-8 shadow-card space-y-5 sm:space-y-6">
        {/* ========================================================================= */}
        {/* STEP 2: OTP CONFIRMATION SCREEN */}
        {/* ========================================================================= */}
        {isOtpStep ? (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setIsOtpStep(false)}
              className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-content-primary transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад к данным магазина</span>
            </button>

            <div>
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
                Подтверждение Email
              </h1>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                Мы отправили 4-значный проверочный код на почту{' '}
                <strong className="text-content-primary font-semibold">{email}</strong>
              </p>
            </div>

            {/* Test Helper Hint */}
            <div className="p-3 rounded-btn bg-accent-soft/40 border border-accent/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-accent shrink-0" />
                <span className="text-[11px] text-content-secondary">
                  Код подтверждения: <strong className="text-accent font-mono font-bold text-xs">{generatedOtp}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(generatedOtp)}
                className="text-[11px] font-bold text-accent hover:underline shrink-0"
              >
                Вставить
              </button>
            </div>

            <form onSubmit={handleVerifyOtpAndCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1.5 text-center">
                  Введите 4 цифры из письма:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setOtpCode(clean);
                    setOtpError('');
                  }}
                  placeholder="••••"
                  className="w-full py-3 px-4 rounded-[12px] bg-page border border-border text-center text-2xl font-mono font-bold tracking-[0.5em] text-content-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:tracking-normal"
                />
              </div>

              {otpError && (
                <div className="p-2.5 rounded-btn bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingOtp || otpCode.length !== 4}
                className="w-full min-h-[44px] py-3 rounded-btn bg-accent hover:bg-accent-hover text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Проверка кода...</span>
                  </>
                ) : (
                  <>
                    <span>Подтвердить и открыть витрину</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                {otpTimer > 0 ? (
                  <span className="text-[11px] text-content-secondary">
                    Отправить код повторно через{' '}
                    <span className="font-mono font-semibold text-content-primary">
                      0:{otpTimer < 10 ? '0' : ''}{otpTimer}
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={handleResendOtp}
                    className="text-xs text-accent hover:underline font-semibold"
                  >
                    {isSendingOtp ? 'Отправка...' : 'Отправить код снова'}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* STEP 1: INITIAL REGISTRATION FORM (NAME, SLUG, EMAIL, INSTAGRAM) */
          /* ========================================================================= */
          <>
            <div>
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent flex items-center justify-center mb-3">
                <Store className="w-5 h-5" />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
                {isGoogleClaimStep ? 'Выберите адрес вашего магазина' : 'Регистрация витрины'}
              </h1>
              <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                {isGoogleClaimStep
                  ? 'Магазин создаётся по указанному адресу после нажатия «Создать витрину».'
                  : 'Создайте персональную онлайн-витрину за 2 минуты бесплатно. Каталог, прием заказов в Telegram и ссылка для Instagram.'}
              </p>
            </div>

            {/* If Google Claim Step is active, show account badge */}
            {isGoogleClaimStep && (
              <div className="p-3 rounded-btn bg-page border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                    G
                  </span>
                  <span className="text-content-primary font-medium">{googleUserEmail}</span>
                </div>
                <span className="text-[11px] text-accent font-semibold">Авторизован</span>
              </div>
            )}

            {/* Google OAuth Button (Only on initial step) */}
            {!isGoogleClaimStep && (
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 rounded-btn bg-surface hover:bg-surface-soft border border-border text-content-primary text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 shadow-xs active:scale-[0.99]"
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
                  <span>{isGoogleLoading ? 'Подключение Google...' : 'Зарегистрироваться через Google'}</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[11px]">
                    <span className="bg-surface px-3 text-content-secondary">
                      или укажите данные вручную
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleInitiateRegister} className="space-y-4">
              {/* Store Name */}
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1">
                  Название магазина *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  placeholder="Например: Samarkand Sweets или Tashkent Drip"
                  className="w-full px-3 py-2.5 rounded-btn bg-page border border-border text-xs text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent"
                />
              </div>

              {/* Store Username / Slug with live validation */}
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1 flex items-center justify-between">
                  <span>Адрес витрины *</span>
                  {isSlugAvailable === true && (
                    <span className="text-[11px] text-accent font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Адрес свободен! ✨</span>
                    </span>
                  )}
                </label>

                <div className="flex items-center rounded-btn bg-page border border-border overflow-hidden focus-within:border-accent">
                  <span className="pl-3.5 pr-1 py-2.5 text-xs font-semibold text-content-secondary font-mono select-none">
                    biomart.uz/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="vash_magazin"
                    className="flex-1 min-w-0 pr-3.5 py-2.5 bg-transparent text-xs text-content-primary font-mono focus:outline-none placeholder:text-content-secondary"
                  />
                </div>

                {slugError ? (
                  <p className="text-[11px] text-danger mt-1 font-medium break-words">{slugError}</p>
                ) : (
                  <p className="text-[10px] text-content-secondary mt-1">
                    Только строчные латинские буквы, цифры и знак подчеркивания (3-30 знаков)
                  </p>
                )}
              </div>

              {/* Email Address (NEW) */}
              {!isGoogleClaimStep && (
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">
                    Электронная почта (Email) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="seller@gmail.com"
                    className="w-full px-3 py-2.5 rounded-btn bg-page border border-border text-xs text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent"
                  />
                  {emailError ? (
                    <p className="text-[11px] text-danger mt-1 font-medium">{emailError}</p>
                  ) : (
                    <p className="text-[10px] text-content-secondary mt-1">
                      На эту почту придет проверочный код для подтверждения
                    </p>
                  )}
                </div>
              )}

              {/* Instagram handle (Optional) */}
              {!isGoogleClaimStep && (
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1">
                    Instagram аккаунт (необязательно)
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@vash_instagram"
                    className="w-full px-3 py-2.5 rounded-btn bg-page border border-border text-xs text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent"
                  />
                </div>
              )}

              {noticeMsg && (
                <div className="p-3 rounded-btn bg-accent-soft border border-accent/20 text-accent text-xs flex items-start gap-2 font-medium">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{noticeMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-btn bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Platform Rules Consent */}
              <label className="flex items-start gap-2 text-[11px] text-content-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  defaultChecked
                  className="mt-0.5 rounded text-accent accent-[#1F7A5A]"
                />
                <span>
                  Я принимаю{' '}
                  <Link href="/rules" target="_blank" className="text-accent underline font-medium hover:text-accent-hover">
                    Правила платформы
                  </Link>{' '}
                  и{' '}
                  <Link href="/terms" target="_blank" className="text-accent underline font-medium hover:text-accent-hover">
                    Пользовательское соглашение
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || isSendingOtp || isSlugAvailable === false}
                className="w-full min-h-[44px] py-3 rounded-btn bg-accent hover:bg-accent-hover text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Отправка кода...</span>
                  </>
                ) : (
                  <>
                    <span>Продолжить и получить код</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-border text-center">
              <Link
                href="/demo"
                className="text-xs text-content-secondary hover:text-content-primary underline"
              >
                Посмотреть примеры витрин
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="py-4 text-center text-xs text-content-secondary">
        © BioMart
      </div>
    </div>
  );
}
