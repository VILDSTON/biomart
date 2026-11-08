'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  Lock,
  Flag,
  CreditCard,
  Ban,
  Search,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Store,
  RefreshCw
} from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';
import { useBioMartStore } from '@/store/useStore';
import { Complaint, BannedEntity, INITIAL_BANS } from '@/lib/moderation';
import { SubscriptionPaymentOrder } from '@/app/api/subscription-payments/route';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'moderation' | 'complaints' | 'bans' | 'payments'>('moderation');

  // Stores from Zustand + local persistence
  const { shops, updateShopSettings } = useBioMartStore();

  // Complaints & Payments state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [payments, setPayments] = useState<SubscriptionPaymentOrder[]>([]);
  const [bans, setBans] = useState<BannedEntity[]>(INITIAL_BANS);
  const [newBanType, setNewBanType] = useState<'phone' | 'slug'>('slug');
  const [newBanValue, setNewBanValue] = useState('');
  const [newBanReason, setNewBanReason] = useState('');

  // Comment Modal state for "needs_changes"
  const [commentModalStore, setCommentModalStore] = useState<string | null>(null);
  const [moderatorComment, setModeratorComment] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('biomart_admin_super');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const loadData = async () => {
    try {
      const [compRes, payRes] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/subscription-payments'),
      ]);
      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(compData.complaints || []);
      }
      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData.payments || []);
      }
    } catch (err) {
      console.warn('Failed to fetch admin data', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin2026' || adminPassword === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('biomart_admin_super', 'true');
      setAuthError('');
    } else {
      setAuthError('Неверный ключ администратора');
    }
  };

  const handleApproveStore = (slug: string) => {
    updateShopSettings(slug, { status: 'published', moderation_comment: undefined });
  };

  const handleRejectStore = (slug: string) => {
    updateShopSettings(slug, { status: 'rejected' });
  };

  const handleSendNeedsChanges = (slug: string) => {
    if (!moderatorComment.trim()) return;
    updateShopSettings(slug, {
      status: 'needs_changes',
      moderation_comment: moderatorComment.trim(),
    });
    setCommentModalStore(null);
    setModeratorComment('');
  };

  const handleAddBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanValue.trim()) return;
    const item: BannedEntity = {
      id: `ban-${Date.now()}`,
      type: newBanType,
      value: newBanValue.trim(),
      reason: newBanReason.trim() || 'Нарушение правил платформы',
      bannedAt: new Date().toISOString().slice(0, 10),
    };
    setBans([item, ...bans]);
    setNewBanValue('');
    setNewBanReason('');
  };

  const handleRemoveBan = (id: string) => {
    setBans(bans.filter((b) => b.id !== id));
  };

  const handleResolveComplaint = async (id: string, status: 'resolved' | 'reviewed') => {
    setComplaints(complaints.map((c) => (c.id === id ? { ...c, status } : c)));
    await fetch('/api/complaints', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
  };

  const handleApprovePayment = async (pay: SubscriptionPaymentOrder) => {
    setPayments(payments.map((p) => (p.id === pay.id ? { ...p, status: 'approved' } : p)));
    updateShopSettings(pay.storeSlug, { plan: pay.plan });
    await fetch('/api/subscription-payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pay.id, status: 'approved' }),
    });
  };

  // If not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-page text-content-primary flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-surface border border-border rounded-[20px] p-6 sm:p-8 shadow-card space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-content-primary">Панель управления BioMart</h1>
            <p className="text-xs text-content-secondary mt-1">
              Вход для администраторов и модераторов безопасности
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Пароль администратора (admin2026)"
              className="w-full px-3.5 py-2.5 rounded-[10px] text-xs bg-page border border-border text-content-primary focus:outline-none focus:border-accent text-center font-mono"
            />
            {authError && <p className="text-xs text-danger font-medium">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
            >
              Войти в админку
            </button>
          </form>

          <Link href="/" className="text-xs text-content-secondary hover:underline inline-block">
            ← Назад на сайт
          </Link>
        </div>
      </div>
    );
  }

  const storesList = Object.values(shops);

  return (
    <div className="min-h-screen bg-page text-content-primary pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border py-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 font-bold text-base text-content-primary">
              <BioMartLogo className="w-7 h-7" color="#1F7A5A" />
              <span>BioMart</span>
            </Link>
            <span className="text-border">/</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent">
              Администратор
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              title="Обновить данные"
              className="p-1.5 rounded-[8px] border border-border bg-page hover:bg-surface text-content-secondary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('biomart_admin_super');
                setIsAuthenticated(false);
              }}
              className="text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'moderation'
                ? 'bg-accent text-white shadow-xs'
                : 'text-content-secondary hover:bg-surface hover:text-content-primary'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Очередь модерации</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {storesList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'complaints'
                ? 'bg-accent text-white shadow-xs'
                : 'text-content-secondary hover:bg-surface hover:text-content-primary'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Жалобы покупателей</span>
            {complaints.filter((c) => c.status === 'new').length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500 text-white font-bold">
                {complaints.filter((c) => c.status === 'new').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-accent text-white shadow-xs'
                : 'text-content-secondary hover:bg-surface hover:text-content-primary'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Платежи подписок</span>
            {payments.filter((p) => p.status === 'pending').length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-900 font-bold">
                {payments.filter((p) => p.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bans')}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'bans'
                ? 'bg-accent text-white shadow-xs'
                : 'text-content-secondary hover:bg-surface hover:text-content-primary'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Черный список</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {bans.length}
            </span>
          </button>
        </div>

        {/* TAB 1: MODERATION QUEUE */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-content-primary">
                Витрины на модерации и публикации
              </h2>
              <p className="text-xs text-content-secondary">
                Проверяйте соответствие товаров и названий правилам платформы перед допуском покупателей
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {storesList.map((shop) => {
                const s = shop.settings;
                const status = s.status || 'published';
                return (
                  <div
                    key={s.slug}
                    className="p-4 sm:p-5 rounded-[16px] bg-surface border border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-content-primary">
                          {s.store_name}
                        </h3>
                        <Link
                          href={`/${s.slug}`}
                          target="_blank"
                          className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                        >
                          <span>biomart.uz/{s.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        {status === 'pending' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            Ожидает проверки (Pending)
                          </span>
                        )}
                        {status === 'published' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                            Опубликован (Published)
                          </span>
                        )}
                        {status === 'needs_changes' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                            Требует правок (Needs Changes)
                          </span>
                        )}
                        {status === 'rejected' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                            Заблокирован (Rejected)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-content-secondary line-clamp-2">
                        {s.description || 'Описание отсутствует'}
                      </p>

                      <div className="text-[11px] text-content-secondary flex items-center gap-3 pt-1">
                        <span>Телефон: <b className="text-content-primary">{s.phone}</b></span>
                        <span>Товаров: <b className="text-content-primary">{shop.products.length}</b></span>
                        <span>Тариф: <b className="text-accent uppercase">{s.plan || 'start'}</b></span>
                      </div>

                      {s.moderation_comment && (
                        <div className="mt-1.5 p-2 rounded-[8px] bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 text-xs">
                          <b>Замечание модератора:</b> {s.moderation_comment}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Link
                        href={`/${s.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-[8px] text-xs font-semibold border border-border bg-page hover:bg-surface text-content-primary transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Смотреть</span>
                      </Link>

                      {status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => handleApproveStore(s.slug)}
                          className="px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-accent hover:bg-accent-hover text-white transition-all shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Одобрить</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setCommentModalStore(s.slug)}
                        className="px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>На правку</span>
                      </button>

                      {status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleRejectStore(s.slug)}
                          className="px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Блок</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-content-primary">
                Жалобы покупателей на магазины и товары
              </h2>
              <p className="text-xs text-content-secondary">
                Поступившие сигналы о нарушениях (мошенничество, контрафакт, мат, спам)
              </p>
            </div>

            {complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-content-secondary bg-surface rounded-[16px] border border-border">
                Новых жалоб нет — все витрины работают в штатном режиме.
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-[14px] bg-surface border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 uppercase">
                          {c.reason}
                        </span>
                        <span className="text-xs font-bold text-content-primary">
                          Магазин: {c.storeName || c.storeSlug}
                        </span>
                        {c.productTitle && (
                          <span className="text-xs text-content-secondary">
                            (Товар: {c.productTitle})
                          </span>
                        )}
                        <span className="text-[10px] text-content-secondary">
                          • {new Date(c.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>

                      {c.comment && (
                        <p className="text-xs text-content-secondary italic">
                          «{c.comment}»
                        </p>
                      )}

                      {c.reporterContact && (
                        <p className="text-[11px] text-content-secondary">
                          Контакт заявителя: <b className="text-content-primary">{c.reporterContact}</b>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRejectStore(c.storeSlug)}
                        className="px-3 py-1.5 rounded-[8px] bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-xs"
                      >
                        Заблокировать витрину
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveComplaint(c.id, 'resolved')}
                        className="px-3 py-1.5 rounded-[8px] bg-page border border-border hover:bg-surface text-content-secondary text-xs font-medium transition-colors"
                      >
                        Отклонить / Закрыть
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-content-primary">
                Очередь подтверждения оплаты тарифов
              </h2>
              <p className="text-xs text-content-secondary">
                Прямые P2P-переводы на карту / Click / Payme за тарифы Plus и Pro
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-content-secondary bg-surface rounded-[16px] border border-border">
                Заявок на оплату тарифов пока нет.
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-[14px] bg-surface border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-soft text-accent uppercase">
                          Тариф {p.plan} • {p.amountUzs.toLocaleString('ru-RU')} сум
                        </span>
                        <span className="text-xs font-bold text-content-primary">
                          Витрина: {p.storeName} ({p.storeSlug})
                        </span>
                        <span className="text-[10px] text-content-secondary">
                          Способ: {p.paymentMethod.toUpperCase()}
                        </span>
                        {p.status === 'approved' && (
                          <span className="text-[10px] text-accent font-semibold bg-accent-soft px-2 py-0.5 rounded">
                            Оплачен и продлён
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-content-secondary space-y-0.5">
                        <p>Контакт плательщика: <b className="text-content-primary">{p.senderPhoneOrTg}</b></p>
                        {p.transactionRef && <p>Номер квитанции: <code className="font-mono">{p.transactionRef}</code></p>}
                      </div>

                      {p.receiptUrl && (
                        <div className="pt-1">
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Посмотреть скриншот чека</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {p.status !== 'approved' ? (
                        <button
                          type="button"
                          onClick={() => handleApprovePayment(p)}
                          className="px-4 py-2 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Подтвердить оплату</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-accent">Подтверждено</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BANS */}
        {activeTab === 'bans' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-content-primary">
                Черный список платформы
              </h2>
              <p className="text-xs text-content-secondary">
                Заблокированные номера телефонов и ники/адреса витрин для защиты от повторной регистрации
              </p>
            </div>

            {/* Add ban form */}
            <form onSubmit={handleAddBan} className="p-4 rounded-[14px] bg-surface border border-border space-y-3">
              <h3 className="text-xs font-bold text-content-primary">Добавить в черный список:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <select
                  value={newBanType}
                  onChange={(e) => setNewBanType(e.target.value as any)}
                  className="px-3 py-2 rounded-[8px] text-xs bg-page border border-border text-content-primary focus:outline-none"
                >
                  <option value="slug">Адрес витрины (slug)</option>
                  <option value="phone">Номер телефона</option>
                </select>
                <input
                  type="text"
                  required
                  value={newBanValue}
                  onChange={(e) => setNewBanValue(e.target.value)}
                  placeholder={newBanType === 'slug' ? 'bad_store' : '+998 90 999 99 99'}
                  className="px-3 py-2 rounded-[8px] text-xs bg-page border border-border text-content-primary focus:outline-none"
                />
                <input
                  type="text"
                  value={newBanReason}
                  onChange={(e) => setNewBanReason(e.target.value)}
                  placeholder="Причина блокировки"
                  className="px-3 py-2 rounded-[8px] text-xs bg-page border border-border text-content-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-[8px] bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Заблокировать
              </button>
            </form>

            {/* Ban list */}
            <div className="space-y-2">
              {bans.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-[10px] bg-surface border border-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-page border border-border uppercase">
                      {b.type}
                    </span>
                    <span className="font-semibold text-content-primary">{b.value}</span>
                    <span className="text-content-secondary">— {b.reason}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBan(b.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Разблокировать
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Comments for Needs Changes */}
      {commentModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-[18px] max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-content-primary">
              Вернуть витрину на правку
            </h3>
            <p className="text-xs text-content-secondary">
              Укажите продавцу, что именно нужно исправить (например: заменить фото товаров, убрать запрещенные слова):
            </p>
            <textarea
              value={moderatorComment}
              onChange={(e) => setModeratorComment(e.target.value)}
              rows={3}
              placeholder="Опишите замечания модератора..."
              className="w-full p-2.5 rounded-[10px] text-xs bg-page border border-border text-content-primary focus:outline-none focus:border-accent"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCommentModalStore(null)}
                className="px-3 py-1.5 rounded-[8px] text-xs text-content-secondary hover:bg-page"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleSendNeedsChanges(commentModalStore)}
                className="px-4 py-1.5 rounded-[8px] bg-accent text-white text-xs font-semibold hover:bg-accent-hover"
              >
                Отправить замечание
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
