'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export const ToastAlert: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleShowToast = (e: CustomEvent<ToastMessage>) => {
      if (!e.detail) return;
      const newToast = {
        id: e.detail.id || `toast_${Date.now()}`,
        type: e.detail.type || 'success',
        message: e.detail.message,
        actionLabel: e.detail.actionLabel,
        onAction: e.detail.onAction,
        duration: e.detail.duration || 3500,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration);
    };

    window.addEventListener('biomart_show_toast' as any, handleShowToast);
    return () => window.removeEventListener('biomart_show_toast' as any, handleShowToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto relative w-full sm:w-80 bg-surface dark:bg-surface-soft border border-border shadow-2xl rounded-2xl overflow-hidden animate-smooth-in"
          style={{
            boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {toast.type === 'error' ? (
                <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              ) : toast.type === 'info' ? (
                <div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              <p className="text-xs font-medium text-content-primary leading-tight truncate">
                {toast.message}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    removeToast(toast.id);
                  }}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold text-accent hover:bg-accent-soft transition-colors"
                >
                  {toast.actionLabel}
                </button>
              )}

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 text-content-secondary hover:text-content-primary rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Animated Progress Bar (Inspired by Video 1) */}
          <div
            className="h-0.5 bg-accent/80 animate-toast-progress"
            style={{
              // @ts-ignore
              '--toast-duration': `${toast.duration}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Global helper to trigger toast
export function showGlobalToast(message: string, type: 'success' | 'error' | 'info' = 'success', actionLabel?: string, onAction?: () => void) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('biomart_show_toast', {
        detail: {
          id: `toast_${Date.now()}`,
          message,
          type,
          actionLabel,
          onAction,
          duration: 3500,
        },
      })
    );
  }
}
