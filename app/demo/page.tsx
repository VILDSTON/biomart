'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { StorefrontClient } from '@/components/StorefrontClient';
import { ArrowRight, ArrowLeft, Store, Sparkles, Check } from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';
import { DEMO_PRESET_SHOPS } from '@/lib/mock-data';

const DEMO_PRESETS = [
  {
    id: 'tashkent_drip',
    title: 'Tashkent Drip',
    niche: 'Одежда',
    tagline: 'Худи, оверсайз футболки и кроссовки',
  },
  {
    id: 'volt_gadgets',
    title: 'Volt Gadgets',
    niche: 'Гаджеты',
    tagline: 'Наушники, повербанки и аксессуары',
  },
  {
    id: 'aura_perfume',
    title: 'Aura Perfume',
    niche: 'Парфюм',
    tagline: 'Селективная парфюмерия и распивы',
  },
];

function DemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeParam = searchParams.get('store');

  const initialStore = DEMO_PRESETS.some((s) => s.id === storeParam)
    ? (storeParam as string)
    : 'tashkent_drip';

  const [activeStore, setActiveStore] = useState(initialStore);

  useEffect(() => {
    if (storeParam && DEMO_PRESETS.some((s) => s.id === storeParam)) {
      setActiveStore(storeParam);
    }
  }, [storeParam]);

  const handleSelectStore = (id: string) => {
    setActiveStore(id);
    router.replace(`/demo?store=${id}`, { scroll: false });
  };

  const currentPreset = DEMO_PRESETS.find((s) => s.id === activeStore) || DEMO_PRESETS[0];

  return (
    <div className="min-h-screen bg-page text-content-primary transition-colors">
      {/* Top Demo Bar */}
      <div className="bg-surface/95 backdrop-blur-md text-content-primary border-b border-border py-2.5 px-4 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity shrink-0"
              title="На главную BioMart"
            >
              <BioMartLogo className="w-5 h-5 shrink-0" color="#1F7A5A" />
              <span className="font-bold text-sm tracking-tight hidden xs:inline">BioMart</span>
            </Link>
            <span className="text-border hidden xs:inline">•</span>
            <div className="flex items-center gap-1 text-xs truncate">
              <span className="text-[10px] uppercase font-semibold text-accent bg-accent-soft px-1.5 py-0.5 rounded">
                Демо
              </span>
              <span className="font-semibold text-content-primary truncate">
                {currentPreset.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/register"
              className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3 py-1.5 rounded-[10px] flex items-center gap-1 transition-all shadow-xs active:scale-95"
            >
              <span>Создать витрину</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Demo Stores Switcher Pills */}
        <div className="max-w-xl mx-auto mt-2 pt-2 border-t border-border flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {DEMO_PRESETS.map((demo) => {
            const isActive = demo.id === activeStore;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectStore(demo.id)}
                className={`px-2.5 py-1 rounded-[8px] text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-page hover:bg-surface text-content-secondary hover:text-content-primary border border-border'
                }`}
              >
                <span>{demo.title}</span>
                <span
                  className={`text-[9px] px-1 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface text-content-secondary'
                  }`}
                >
                  {demo.niche}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render the full storefront with active demo slug */}
      <React.Suspense fallback={null}>
        <StorefrontClient
          key={activeStore}
          initialSlug={activeStore}
          initialSettings={DEMO_PRESET_SHOPS[activeStore]?.settings}
          initialCategories={DEMO_PRESET_SHOPS[activeStore]?.categories}
          initialProducts={DEMO_PRESET_SHOPS[activeStore]?.products}
          isDemo={true}
        />
      </React.Suspense>
    </div>
  );
}

export default function DemoPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-page flex items-center justify-center text-xs font-mono">Загрузка витрины...</div>}>
      <DemoContent />
    </React.Suspense>
  );
}
