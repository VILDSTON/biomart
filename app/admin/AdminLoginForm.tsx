'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, EyeOff, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export function AdminLoginForm() {
  const [step, setStep] = useState<'passkey' | '2fa'>('passkey');
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(180); // 3 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // 2FA countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === '2fa' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!passkey.trim()) {
      setErrorMsg('Введите ключ доступа');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Неверный ключ доступа администратора');
        setIsLoading(false);
        return;
      }

      if (data.step === '2fa_required') {
        setStep('2fa');
        setTimer(data.expiresInSeconds || 180);
        setInfoMsg(data.message || 'Одноразовый 6-значный код отправлен в Telegram владельца платформы');
        setCode('');
      } else if (data.authorized) {
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = code.replace(/\D/g, '').slice(0, 6);
    if (cleanCode.length !== 6) {
      setErrorMsg('Введите полный 6-значный код из Telegram');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_2fa', code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Неверный код подтверждения');
        setIsLoading(false);
        return;
      }

      // Successfully authorized: server set signed HttpOnly biomart_admin_super cookie
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка проверки кода');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-surface border border-border rounded-card p-5 sm:p-8 shadow-card space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-1.5 font-bold text-xl text-content-primary mb-2">
          <BioMartLogo className="w-9 h-9" color="#1F7A5A" />
          <span>BioMart</span>
        </Link>

        <div className="w-12 h-12 rounded-[14px] bg-accent-soft text-accent flex items-center justify-center mx-auto shadow-xs">
          <Shield className="w-6 h-6" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
          {step === 'passkey' ? 'Вход для платформы' : 'Двухфакторная защита (2FA)'}
        </h1>
        <p className="text-xs text-content-secondary max-w-sm mx-auto leading-relaxed">
          {step === 'passkey'
            ? 'Панель управления доступна исключительно владельцу платформы BioMart.'
            : 'Введите 6-значный одноразовый код, отправленный официальным ботом в Telegram.'}
        </p>
      </div>

      {infoMsg && (
        <div className="p-3 rounded-btn bg-accent-soft border border-accent/20 text-accent text-xs flex items-start gap-2 font-medium">
          <Send className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{infoMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-btn bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-1.5 font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="break-words">{errorMsg}</span>
        </div>
      )}

      {step === 'passkey' ? (
        <form onSubmit={handlePasskeySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1">
              Ключ владельца (ADMIN_PASSKEY)
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                autoFocus
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Введите секретный ключ"
                className="w-full pl-3 pr-11 py-2.5 rounded-btn bg-page border border-border text-base sm:text-xs text-content-primary font-mono focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Скрыть ключ' : 'Показать ключ'}
                className="absolute right-0 top-0 bottom-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-content-secondary hover:text-content-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passkey.trim()}
            className="w-full min-h-[44px] py-3 rounded-btn bg-accent hover:bg-accent-hover text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Проверка ключа...</span>
              </>
            ) : (
              <>
                <span>Получить код в Telegram</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handle2faSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1.5 text-center">
              Одноразовый код (6 цифр):
            </label>
            <input
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              required
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(clean);
                setErrorMsg('');
              }}
              placeholder="••••••"
              className="w-full py-3 px-4 rounded-[12px] bg-page border border-border text-center text-2xl font-mono font-bold tracking-[0.4em] text-content-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:tracking-normal"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-content-secondary px-1">
            <span>Срок действия:</span>
            <span className={`font-mono font-semibold ${timer < 30 ? 'text-danger' : 'text-content-primary'}`}>
              0{Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6 || timer === 0}
            className="w-full min-h-[44px] py-3 rounded-btn bg-accent hover:bg-accent-hover text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Проверка кода...</span>
              </>
            ) : (
              <>
                <span>Подтвердить вход</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('passkey');
                setCode('');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className="text-xs text-content-secondary hover:text-content-primary underline"
            >
              ← Ввести ключ заново
            </button>
          </div>
        </form>
      )}

      <div className="pt-3 border-t border-border text-center">
        <Link href="/" className="text-xs text-content-secondary hover:text-content-primary">
          ← Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
