'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Shield,
  Trash2,
  CreditCard,
  Rocket,
  Settings,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { AdminAuditEntry } from '@/lib/admin-audit';

export function AdminAuditTab() {
  const [logs, setLogs] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs?limit=150');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const actionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    update_platform_settings: {
      label: 'Настройки платформы',
      icon: <Settings className="w-3.5 h-3.5" />,
    },
    cleanup_storage: {
      label: 'Очистка Storage',
      icon: <Trash2 className="w-3.5 h-3.5" />,
    },
    create_quick_store: {
      label: 'Создание витрины',
      icon: <Rocket className="w-3.5 h-3.5" />,
    },
    approve_subscription_payment: {
      label: 'Одобрение подписки',
      icon: <CreditCard className="w-3.5 h-3.5" />,
    },
    update_store_admin: {
      label: 'Модерация витрины',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    update_complaint_status: {
      label: 'Обработка жалобы',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedAction !== 'all' && log.action !== selectedAction) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const targetMatch = (log.target_id || '').toLowerCase().includes(q);
      const actionMatch = (log.action || '').toLowerCase().includes(q);
      const detailsMatch = JSON.stringify(log.details || {}).toLowerCase().includes(q);
      return targetMatch || actionMatch || detailsMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-content-primary">
              Журнал действий администратора (Audit Trail)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold tabular-nums">
              {logs.length} записей
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-0.5">
            Фиксация ручных операций, смены реквизитов, продлений и чистки файлов для контроля платформы
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="min-h-[44px] px-4 py-2 rounded-[12px] text-xs font-semibold border border-border bg-page hover:bg-surface text-content-primary transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-[16px] bg-surface border border-border space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-content-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по магазину, действию или параметру..."
              className="w-full min-h-[44px] pl-9 pr-3 rounded-[10px] border border-border bg-page text-content-primary text-xs focus:outline-hidden focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedAction('all')}
              className={`min-h-[44px] px-3 rounded-[10px] text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedAction === 'all'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-page border border-border text-content-secondary hover:text-content-primary'
              }`}
            >
              Все действия
            </button>
            {Object.keys(actionLabels).map((actionKey) => (
              <button
                key={actionKey}
                type="button"
                onClick={() => setSelectedAction(actionKey)}
                className={`min-h-[44px] px-3 rounded-[10px] text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedAction === actionKey
                    ? 'bg-accent text-white font-semibold'
                    : 'bg-page border border-border text-content-secondary hover:text-content-primary'
                }`}
              >
                {actionLabels[actionKey].icon}
                <span>{actionLabels[actionKey].label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      {filteredLogs.length === 0 ? (
        <div className="p-8 text-center bg-surface border border-border rounded-[16px] text-xs text-content-secondary">
          {loading ? 'Загрузка журнала аудита...' : 'Нет записей, соответствующих заданным критериям'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log, idx) => {
            const labelInfo = actionLabels[log.action] || {
              label: log.action,
              icon: <FileText className="w-3.5 h-3.5" />,
            };
            const timeStr = log.created_at
              ? new Date(log.created_at).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'Только что';

            return (
              <div
                key={log.id || `log_${idx}`}
                className="p-3.5 sm:p-4 rounded-[14px] bg-surface border border-border hover:border-accent/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0 mt-0.5">
                    {labelInfo.icon}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-content-primary">
                        {labelInfo.label}
                      </span>
                      {log.target_id && (
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[6px] bg-page border border-border text-content-secondary">
                          {log.target_type ? `${log.target_type}: ` : ''}
                          <b className="text-content-primary">{log.target_id}</b>
                        </span>
                      )}
                      <span className="text-[10px] text-content-secondary font-medium">
                        (админ: {log.performed_by || 'admin'})
                      </span>
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-[11px] font-mono text-content-secondary bg-page/70 p-2 rounded-[8px] border border-border/50 break-all">
                        {JSON.stringify(log.details, null, 1)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-content-secondary tabular-nums shrink-0 self-end md:self-center">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
