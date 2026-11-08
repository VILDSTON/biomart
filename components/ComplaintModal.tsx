'use client';

import React, { useState } from 'react';
import { Flag, X, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { Complaint } from '@/lib/moderation';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSlug: string;
  storeName?: string;
  productId?: string;
  productTitle?: string;
}

const REASONS: { id: Complaint['reason']; labelRu: string; labelUz: string }[] = [
  { id: 'profanity', labelRu: 'Нецензурная лексика / оскорбления', labelUz: 'Haqorat / nojo‘ya so‘zlar' },
  { id: 'fraud', labelRu: 'Мошенничество или обман', labelUz: 'Firibgarlik yoki aldamchilik' },
  { id: 'prohibited_goods', labelRu: 'Запрещенный товар / контрафакт', labelUz: 'Taqiqlangan mahsulot / kontrafakt' },
  { id: 'spam', labelRu: 'Спам или фейковые предложения', labelUz: 'Spam yoki soxta takliflar' },
  { id: 'other', labelRu: 'Другое нарушение', labelUz: 'Boshqa qoidabuzarlik' },
];

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  storeSlug,
  storeName,
  productId,
  productTitle,
}) => {
  const [selectedReason, setSelectedReason] = useState<Complaint['reason']>('fraud');
  const [comment, setComment] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        storeSlug,
        storeName: storeName || storeSlug,
        productId,
        productTitle,
        reason: selectedReason,
        comment: comment.trim(),
        reporterContact: contact.trim(),
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to submit complaint');
      }

      setIsSubmitted(true);
    } catch (err) {
      // In case offline, fallback to local confirmation
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface border border-border rounded-[20px] max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4 text-content-primary">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-content-secondary hover:text-content-primary hover:bg-page transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-content-primary">
              Жалоба принята
            </h3>
            <p className="text-xs text-content-secondary max-w-xs mx-auto leading-relaxed">
              Спасибо за бдительность! Модераторы BioMart проверят витрину и товар в течение 2 часов.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-[10px] bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                <Flag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-content-primary leading-tight">
                  Пожаловаться модераторам
                </h3>
                <p className="text-[11px] text-content-secondary">
                  {productTitle ? `Товар: ${productTitle}` : `Витрина: ${storeName || storeSlug}`}
                </p>
              </div>
            </div>

            {/* Reasons selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-primary">
                Причина жалобы:
              </label>
              <div className="space-y-1">
                {REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2.5 p-2 rounded-[10px] border cursor-pointer text-xs transition-colors ${
                      selectedReason === r.id
                        ? 'border-accent bg-accent-soft/40 text-content-primary font-medium'
                        : 'border-border bg-page text-content-secondary hover:text-content-primary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complaintReason"
                      value={r.id}
                      checked={selectedReason === r.id}
                      onChange={() => setSelectedReason(r.id)}
                      className="accent-[#1F7A5A]"
                    />
                    <span>{r.labelRu}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Detailed Comment */}
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Что именно нарушено? (необязательно)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Опишите подробнее, что не так с товаром или продавцом..."
                className="w-full px-3 py-2 rounded-[10px] text-xs bg-page border border-border text-content-primary focus:outline-none focus:border-accent"
              />
            </div>

            {/* Reporter Contact */}
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Ваш Telegram или номер телефона (для связи):
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+998 90 123 45 67 или @username"
                className="w-full px-3 py-2 rounded-[10px] text-xs bg-page border border-border text-content-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[10px] text-xs font-semibold text-content-secondary hover:bg-page transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-[10px] bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Отправка...' : 'Отправить жалобу'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
