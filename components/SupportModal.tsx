'use client';

import React, { useState } from 'react';
import { X, Send, HelpCircle, CheckCircle2, AlertCircle, Loader2, MessageSquare, Bug, CreditCard, Sparkles } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopSlug?: string;
  defaultCategory?: 'billing' | 'bug' | 'orders' | 'feature' | 'other';
}

export function SupportModal({ isOpen, onClose, shopSlug = '', defaultCategory = 'bug' }: SupportModalProps) {
  const [category, setCategory] = useState<'billing' | 'bug' | 'orders' | 'feature' | 'other'>(defaultCategory);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!contact.trim()) {
      setErrorMessage('Пожалуйста, укажите ваш Telegram (@username) или номер телефона');
      return;
    }

    if (!message.trim()) {
      setErrorMessage('Опишите, пожалуйста, с какой проблемой вы столкнулись');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          shop_slug: shopSlug || undefined,
          contact: contact.trim(),
          category,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при отправке');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Не удалось отправить сообщение. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setMessage('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#FFFFFF] border border-[#E7E4DC] rounded-[16px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E7E4DC] flex items-center justify-between bg-[#F7F6F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#E4F1EB] text-[#1F7A5A] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#1A1A1A] leading-tight">
                Поддержка и связь с основателем
              </h2>
              <p className="text-[11px] text-[#6B6B66]">
                Сообщение придёт напрямую в личный Telegram
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-[8px] hover:bg-[#E7E4DC]/60 flex items-center justify-center text-[#6B6B66] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-[#E4F1EB] text-[#1F7A5A] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-[#1A1A1A]">
                  Обращение успешно отправлено!
                </h3>
                <p className="text-xs text-[#6B6B66] max-w-xs mx-auto leading-relaxed">
                  Основатель BioMart получил уведомление в Telegram и свяжется с вами по указанному контакту.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] bg-[#1F7A5A] hover:bg-[#196349] text-white text-xs font-semibold transition-colors"
              >
                Понятно, закрыть
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                  С чем связана проблема?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('billing')}
                    className={`flex items-center gap-2 p-2.5 text-left rounded-[10px] border text-xs transition-colors ${
                      category === 'billing'
                        ? 'border-[#1F7A5A] bg-[#E4F1EB]/50 text-[#1F7A5A] font-semibold'
                        : 'border-[#E7E4DC] text-[#1A1A1A] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Подписка / Оплата</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('bug')}
                    className={`flex items-center gap-2 p-2.5 text-left rounded-[10px] border text-xs transition-colors ${
                      category === 'bug'
                        ? 'border-[#1F7A5A] bg-[#E4F1EB]/50 text-[#1F7A5A] font-semibold'
                        : 'border-[#E7E4DC] text-[#1A1A1A] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    <Bug className="w-4 h-4 shrink-0" />
                    <span>Баг / Ошибка на сайте</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('orders')}
                    className={`flex items-center gap-2 p-2.5 text-left rounded-[10px] border text-xs transition-colors ${
                      category === 'orders'
                        ? 'border-[#1F7A5A] bg-[#E4F1EB]/50 text-[#1F7A5A] font-semibold'
                        : 'border-[#E7E4DC] text-[#1A1A1A] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Заказы / Telegram бот</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('feature')}
                    className={`flex items-center gap-2 p-2.5 text-left rounded-[10px] border text-xs transition-colors ${
                      category === 'feature'
                        ? 'border-[#1F7A5A] bg-[#E4F1EB]/50 text-[#1F7A5A] font-semibold'
                        : 'border-[#E7E4DC] text-[#1A1A1A] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Предложение / Идея</span>
                  </button>
                </div>
              </div>

              {/* Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Ваше имя или магазин
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: TASHKENT DRIP"
                    className="w-full px-3 py-2 text-xs rounded-[10px] border border-[#E7E4DC] focus:outline-none focus:border-[#1F7A5A] focus:ring-1 focus:ring-[#1F7A5A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Telegram или телефон *
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="@username или +998 90..."
                    className="w-full px-3 py-2 text-xs rounded-[10px] border border-[#E7E4DC] focus:outline-none focus:border-[#1F7A5A] focus:ring-1 focus:ring-[#1F7A5A]"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Подробно опишите проблему *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите, что пошло не так (например: 'Оформил тариф Plus, списали оплату, но в кабинете остался Start' или 'При загрузке товара на телефоне вылетает ошибка'...)"
                  className="w-full px-3 py-2 text-xs rounded-[10px] border border-[#E7E4DC] focus:outline-none focus:border-[#1F7A5A] focus:ring-1 focus:ring-[#1F7A5A] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#6B6B66]">
                  Бот: @BioMartAssistant_bot
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#1F7A5A] hover:bg-[#196349] disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Отправить в Telegram</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
