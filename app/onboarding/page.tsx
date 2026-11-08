'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Store, ShieldCheck, AlertCircle } from 'lucide-react';
import { useBioMartStore } from '@/store/useStore';
import { isSlugValid } from '@/lib/security';
import { BioMartLogo } from '@/components/BioMartLogo';

export default function OnboardingPage() {
  const router = useRouter();
  const { shops, registerShop, setActiveSlug } = useBioMartStore();

  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [instagram, setInstagram] = useState('');
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 30);
  }

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    if (!slug || slug === cleanSlug(storeName)) {
      setSlug(cleanSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(cleanSlug(val));
  };

  useEffect(() => {
    const trimmed = slug.trim();
    if (!trimmed) {
      setIsSlugAvailable(null);
      setSlugError('');
      return;
    }

    if (trimmed.length < 3) {
      setIsSlugAvailable(false);
      setSlugError('Укажите от 3 до 30 латинских символов');
      return;
    }

    if (!isSlugValid(trimmed)) {
      setIsSlugAvailable(false);
      setSlugError('Ссылка зарезервирована платформой или содержит запрещённые символы');
      return;
    }

    if (shops[trimmed]) {
      setIsSlugAvailable(false);
      setSlugError(`Магазин «${trimmed}» уже существует. Нажмите «Войти»`);
      return;
    }

    setIsSlugAvailable(true);
    setSlugError('');
  }, [slug, shops]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!storeName.trim()) {
      setErrorMsg('Укажите название вашего магазина');
      return;
    }

    if (!slug.trim()) {
      setErrorMsg('Укажите короткую ссылку для магазина');
      return;
    }

    if (isSlugAvailable === false) {
      setErrorMsg(slugError || 'Пожалуйста, укажите корректную короткую ссылку');
      return;
    }

    setIsSubmitting(true);

    try {
      registerShop(slug, storeName.trim(), instagram.trim());
      setActiveSlug(slug);

      sessionStorage.setItem('biomart_admin_auth', 'true');
      sessionStorage.setItem('biomart_current_slug', slug);

      // Persist to Supabase DB if configured
      try {
        await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            store_name: storeName.trim(),
            instagram_url: instagram.trim() ? `https://instagram.com/${instagram.trim().replace('@', '')}` : '',
          }),
        });
      } catch (e) {
        console.warn('Supabase store sync warning:', e);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Не удалось зарегистрировать магазин');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A1A1A] flex flex-col justify-between px-4 py-4">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto pt-2 pb-6 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-[1px] font-bold text-lg sm:text-xl text-content-primary">
          <BioMartLogo className="w-10 h-10 shrink-0" color="#1F7A5A" />
          <span>BioMart</span>
        </Link>

        <span className="text-xs text-[#6B6B66] font-medium flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A5A]" />
          <span>Быстрый старт</span>
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto bg-[#FFFFFF] border border-[#E7E4DC] rounded-[14px] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="w-10 h-10 rounded-[10px] bg-[#E4F1EB] text-[#1F7A5A] flex items-center justify-center mb-3">
            <Store className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1A1A1A]">
            Создайте вашу витрину
          </h1>
          <p className="text-xs text-[#6B6B66] mt-1 leading-relaxed">
            Вы вошли через Google. Придумайте название и короткую ссылку для ссылки в шапке Instagram или Telegram.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1A1A1A] mb-1">
              Название магазина или бренда *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={storeName}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              placeholder="Например: Sakura Studio, Tashkent Drip"
              className="w-full px-3 py-2 rounded-[10px] bg-[#FFFFFF] border border-[#E7E4DC] text-xs text-[#1A1A1A] placeholder:text-[#6B6B66] focus:outline-none focus:border-[#1F7A5A]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A1A1A] mb-1 flex items-center justify-between">
              <span>Короткая ссылка на магазин *</span>
              {isSlugAvailable === true && (
                <span className="text-[11px] font-medium text-[#1F7A5A] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Ссылка свободна</span>
                </span>
              )}
              {isSlugAvailable === false && (
                <span className="text-[11px] font-medium text-[#C2410C]">
                  {slugError || 'Ссылка занята'}
                </span>
              )}
            </label>

            <div className="flex items-center rounded-[10px] bg-[#FFFFFF] border border-[#E7E4DC] overflow-hidden focus-within:border-[#1F7A5A]">
              <span className="pl-3.5 pr-1 py-2 text-xs font-medium text-[#6B6B66] font-mono select-none">
                /
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="vash_magazin"
                className="flex-1 min-w-0 pr-3.5 py-2 bg-transparent text-xs text-[#1A1A1A] font-mono focus:outline-none placeholder:text-[#6B6B66]"
              />
            </div>
            <p className="text-[10px] text-[#6B6B66] mt-1">
              Латинские буквы, цифры и знак подчёркивания (как в Instagram)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A1A1A] mb-1">
              Instagram ник (необязательно)
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@sakura_store"
              className="w-full px-3 py-2 rounded-[10px] bg-[#FFFFFF] border border-[#E7E4DC] text-xs text-[#1A1A1A] placeholder:text-[#6B6B66] focus:outline-none focus:border-[#1F7A5A]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-[10px] bg-[#FFF5F5] border border-[#FCA5A5] text-[#C2410C] text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isSlugAvailable === false}
            className="w-full py-2.5 rounded-[10px] bg-[#1F7A5A] hover:bg-[#17634A] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>Завершить регистрацию</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="py-4 text-center text-xs text-[#6B6B66]">
        © BioMart — витрины для продавцов
      </div>
    </div>
  );
}
