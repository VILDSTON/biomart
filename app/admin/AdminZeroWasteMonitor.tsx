'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Database,
  HardDrive,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Search,
  ArrowUpDown,
  FileCode,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface AdminZeroWasteMonitorProps {
  storesList: any[];
}

export function AdminZeroWasteMonitor({ storesList }: AdminZeroWasteMonitorProps) {
  const [storageReport, setStorageReport] = useState<{
    is_configured: boolean;
    total_files: number;
    active_files: number;
    orphaned_count: number;
    orphaned_bytes: number;
    orphaned_paths: string[];
    storage_usage_bytes: number;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<{ deleted: number; bytes: number } | null>(null);
  const [showConfirmClean, setShowConfirmClean] = useState(false);

  // Anomaly filter & sort
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'overlimit' | 'stuck'>('all');
  const [sortBy, setSortBy] = useState<'products' | 'views'>('products');

  const scanStorage = useCallback(async () => {
    setIsScanning(true);
    setCleanResult(null);
    try {
      const res = await fetch('/api/admin/cleanup-storage');
      if (res.ok) {
        const json = await res.json();
        setStorageReport(json);
      }
    } catch (err) {
      console.warn('Storage scan failed', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    scanStorage();
  }, [scanStorage]);

  const executeCleanup = async () => {
    setIsCleaning(true);
    setShowConfirmClean(false);
    try {
      const res = await fetch('/api/admin/cleanup-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCleanResult({ deleted: data.deleted_count, bytes: data.bytes_reclaimed });
        // Rescan storage after deletion
        scanStorage();
      }
    } catch (err) {
      console.warn('Cleanup error', err);
    } finally {
      setIsCleaning(false);
    }
  };

  // 1. Calculate Database Table Rows (Estimated / Aggregated)
  let totalProductsCount = 0;
  storesList.forEach((s) => {
    totalProductsCount += Number(s.productCount || s.products_count || 0);
  });
  const totalStores = storesList.length;

  // Supabase Free Tier Limits: 500 MB DB (~500,000 rows max safe), 1 GB Storage (1,073,741,824 bytes)
  const MAX_STORAGE_BYTES = 1073741824; // 1 GB
  const usedStorageBytes = storageReport?.storage_usage_bytes || 0;
  const storageUsagePercent = Math.min(Math.round((usedStorageBytes / MAX_STORAGE_BYTES) * 100), 100);

  // 2. Anomaly Detection: Stores exceeding plan limits
  const anomalyStores = storesList.map((s) => {
    const plan = (s.settings?.plan || s.plan || 'start').toLowerCase();
    const pCount = Number(s.productCount || s.products_count || 0);
    const storeName = s.settings?.store_name || s.store_name || s.slug;

    let isOverlimit = false;
    let limit = 10;
    if (plan === 'start' && pCount > 10) {
      isOverlimit = true;
      limit = 10;
    } else if (plan === 'plus' && pCount > 100) {
      isOverlimit = true;
      limit = 100;
    }

    return {
      slug: s.slug,
      store_name: storeName,
      plan,
      products_count: pCount,
      limit,
      isOverlimit,
      isStuck: pCount === 0,
      phone: s.settings?.phone || s.phone,
      telegram: s.settings?.telegram_username || s.telegram_username,
    };
  });

  const filteredStores = anomalyStores.filter((s) => {
    if (anomalyFilter === 'overlimit') return s.isOverlimit;
    if (anomalyFilter === 'stuck') return s.isStuck;
    return true;
  });

  filteredStores.sort((a, b) => b.products_count - a.products_count);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 МБ';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${mb.toFixed(1)} МБ`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-accent" />
            <span>Zero-Waste Монитор лимитов и хранилища Supabase</span>
          </h2>
          <p className="text-xs text-content-secondary">
            Контроль бесплатного тарифа (500 МБ DB / 1 ГБ Storage) и очистка осиротевших картинок
          </p>
        </div>

        <button
          type="button"
          onClick={scanStorage}
          disabled={isScanning}
          title="Пересканировать хранилище"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-btn bg-surface border border-border text-content-secondary hover:text-content-primary flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {cleanResult && (
        <div className="p-4 rounded-card bg-accent-soft border border-accent/20 text-accent text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Успешно удалено <b>{cleanResult.deleted}</b> мусорных файлов. Освобождено{' '}
              <b>{formatBytes(cleanResult.bytes)}</b> дискового пространства!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCleanResult(null)}
            className="text-xs font-semibold underline"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* STORAGE & DATABASE QUOTA GAUGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Storage 1 GB Quota */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-accent" />
              <span>Supabase Storage (store-assets)</span>
            </h3>
            <span className="text-[11px] font-semibold text-content-secondary tabular-nums">
              Лимит: 1 ГБ
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-secondary">Занято пространства:</span>
              <span className="font-bold text-content-primary tabular-nums">
                {formatBytes(usedStorageBytes)} / 1 024 МБ ({storageUsagePercent}%)
              </span>
            </div>

            <div className="h-2.5 w-full bg-page rounded-full overflow-hidden border border-border/40">
              <div
                style={{ width: `${Math.max(storageUsagePercent, 2)}%` }}
                className={`h-full rounded-full transition-all ${
                  storageUsagePercent > 80
                    ? 'bg-danger'
                    : storageUsagePercent > 50
                    ? 'bg-amber-500'
                    : 'bg-accent'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-[8px] bg-page border border-border">
              <span className="text-[10px] text-content-secondary block">Всего файлов</span>
              <span className="text-sm font-bold text-content-primary tabular-nums">
                {storageReport?.total_files || 0}
              </span>
            </div>
            <div className="p-2.5 rounded-[8px] bg-page border border-border">
              <span className="text-[10px] text-content-secondary block">Активных фото</span>
              <span className="text-sm font-bold text-accent tabular-nums">
                {storageReport?.active_files || 0}
              </span>
            </div>
          </div>

          {/* Orphaned files banner & Cleanup button */}
          <div className="pt-2 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Осиротевших (мусорных) файлов:</span>
                <b className="text-amber-500 tabular-nums">{storageReport?.orphaned_count || 0}</b>
              </div>
              <div className="text-[10px] text-content-secondary tabular-nums">
                Занимают: {formatBytes(storageReport?.orphaned_bytes || 0)}
              </div>
            </div>

            <button
              type="button"
              disabled={isCleaning || (storageReport?.orphaned_count || 0) === 0}
              onClick={() => setShowConfirmClean(true)}
              className="min-h-[44px] px-4 py-2 rounded-btn bg-danger/10 hover:bg-danger/20 text-danger text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить мусор</span>
            </button>
          </div>
        </div>

        {/* Database Rows Quota */}
        <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" />
              <span>База данных PostgreSQL</span>
            </h3>
            <span className="text-[11px] font-semibold text-content-secondary tabular-nums">
              Лимит: 500 МБ
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-[8px] bg-page border border-border space-y-0.5">
              <span className="text-[10px] text-content-secondary">Витрин (stores)</span>
              <div className="text-base font-bold text-content-primary tabular-nums">
                {totalStores}
              </div>
            </div>

            <div className="p-3 rounded-[8px] bg-page border border-border space-y-0.5">
              <span className="text-[10px] text-content-secondary">Товаров (products)</span>
              <div className="text-base font-bold text-content-primary tabular-nums">
                {totalProductsCount}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-[10px] bg-page border border-border text-xs text-content-secondary space-y-1">
            <div className="font-semibold text-content-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              <span>Zero-Waste защита активна</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Аналитика витрин агрегируется строго посуточно (1 строка в сутки на магазин вместо миллионов строк сырых логов). Ваш бесплатный лимит базы защищен от переполнения.
            </p>
          </div>
        </div>
      </div>

      {/* CONFIRMATION CLEANUP MODAL */}
      {showConfirmClean && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface border border-border rounded-card p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-danger">
              <div className="w-10 h-10 rounded-[10px] bg-danger/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-content-primary">
                  Удалить {storageReport?.orphaned_count} мусорных файлов?
                </h4>
                <p className="text-xs text-content-secondary">
                  Будет освобождено {formatBytes(storageReport?.orphaned_bytes || 0)}
                </p>
              </div>
            </div>

            <p className="text-xs text-content-secondary leading-relaxed">
              Будут безвозвратно удалены картинки из хранилища Supabase Storage, которые больше не привязаны ни к одному товару или логотипу магазина. Активные товары не пострадают.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClean(false)}
                className="min-h-[44px] px-4 py-2 rounded-btn bg-page border border-border text-xs font-semibold text-content-secondary hover:text-content-primary"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={executeCleanup}
                className="min-h-[44px] px-4 py-2 rounded-btn bg-danger text-white text-xs font-semibold hover:bg-danger/90"
              >
                Да, удалить мусор
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANOMALY DETECTION & OVERLIMIT PROTECTION */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Поиск аномалий и контроль лимитов витрин</span>
            </h3>
            <p className="text-[11px] text-content-secondary">
              Сортировка магазинов по товарам для выявления спама или попыток превысить бесплатные лимиты
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-1 bg-page border border-border rounded-btn self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAnomalyFilter('all')}
              className={`min-h-[38px] px-3 py-1 rounded-[8px] text-xs font-semibold transition-all ${
                anomalyFilter === 'all'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Все ({anomalyStores.length})
            </button>
            <button
              type="button"
              onClick={() => setAnomalyFilter('overlimit')}
              className={`min-h-[38px] px-3 py-1 rounded-[8px] text-xs font-semibold transition-all ${
                anomalyFilter === 'overlimit'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Сверх лимита ({anomalyStores.filter((s) => s.isOverlimit).length})
            </button>
            <button
              type="button"
              onClick={() => setAnomalyFilter('stuck')}
              className={`min-h-[38px] px-3 py-1 rounded-[8px] text-xs font-semibold transition-all ${
                anomalyFilter === 'stuck'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              0 товаров ({anomalyStores.filter((s) => s.isStuck).length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-content-secondary font-semibold">
                <th className="py-2.5 px-2">Витрина</th>
                <th className="py-2.5 px-2">Тариф</th>
                <th className="py-2.5 px-2">Товаров в каталоге</th>
                <th className="py-2.5 px-2">Лимит тарифа</th>
                <th className="py-2.5 px-2">Статус</th>
                <th className="py-2.5 px-2 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStores.map((store) => (
                <tr key={store.slug} className="hover:bg-page/50 transition-colors">
                  <td className="py-3 px-2 font-semibold text-content-primary">
                    <div>{store.store_name}</div>
                    <div className="text-[11px] text-content-secondary font-mono">
                      /{store.slug}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-page border border-border">
                      {store.plan}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-bold tabular-nums">
                    {store.products_count}
                  </td>
                  <td className="py-3 px-2 text-content-secondary tabular-nums">
                    {store.limit === 999999 ? 'Безлимит' : `до ${store.limit}`}
                  </td>
                  <td className="py-3 px-2">
                    {store.isOverlimit ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-danger/10 text-danger font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Превышен лимит</span>
                      </span>
                    ) : store.isStuck ? (
                      <span className="text-[11px] text-amber-500 font-medium">
                        Не заполнена
                      </span>
                    ) : (
                      <span className="text-[11px] text-accent font-medium">
                        Норма
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Link
                      href={`/${store.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                    >
                      <span>Открыть</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
