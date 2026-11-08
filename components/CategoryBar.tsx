'use client';

import React from 'react';
import { Search, X, LayoutGrid, List } from 'lucide-react';
import { CatalogLayout, Category, StoreSettings } from '@/types';
import { useBioMartStore } from '@/store/useStore';
import { translations } from '@/lib/i18n';
import { getContrastTextColor } from '@/lib/utils';

interface CategoryBarProps {
  categories: Category[];
  activeSlug: string;
  onSelectCategory: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  productCountByCategory?: Record<string, number>;
  layout: CatalogLayout;
  onToggleLayout: (layout: CatalogLayout) => void;
  storeSettings: StoreSettings;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeSlug,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  productCountByCategory,
  layout,
  onToggleLayout,
  storeSettings,
}) => {
  const { language } = useBioMartStore();
  const t = translations[language];
  const customAccent = storeSettings.accent_color || '#1F7A5A';
  const accentTextColor = getContrastTextColor(customAccent);

  return (
    <div className="sticky top-0 z-30 pt-3 pb-2.5 px-4 border-b border-border bg-surface/95 backdrop-blur-md transition-colors">
      {/* Search Input & Layout Toggle */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-secondary">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-8 py-2.5 rounded-btn text-xs border border-border bg-page text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-content-secondary hover:text-content-primary"
              aria-label={t.clearSearch}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Layout Switcher (Strict Concentric Radius Segments) */}
        <div 
          className="flex items-center p-1 rounded-lg border border-border bg-page shrink-0 gap-1"
          role="radiogroup"
          aria-label="Переключение вида каталога"
        >
          <button
            type="button"
            onClick={() => onToggleLayout('grid')}
            className={`w-7 h-7 rounded-[6px] transition-all flex items-center justify-center ${
              layout === 'grid'
                ? 'bg-surface text-accent shadow-xs'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface/50'
            }`}
            title="Сетка"
            aria-label="Сетка"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleLayout('list')}
            className={`w-7 h-7 rounded-[6px] transition-all flex items-center justify-center ${
              layout === 'list'
                ? 'bg-surface text-accent shadow-xs'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface/50'
            }`}
            title="Список"
            aria-label="Список"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((category) => {
          const isActive = activeSlug === category.slug;
          const count = productCountByCategory?.[category.slug];

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.slug)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-btn text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-accent text-accent-text border border-accent shadow-xs'
                  : 'bg-page border border-border text-content-primary hover:bg-surface-soft'
              }`}
            >
              <span>{category.name}</span>
              {typeof count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/20 text-accent-text' : 'text-content-secondary bg-surface-soft'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
