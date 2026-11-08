'use client';

import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, X, Send, Heart, Sparkles } from 'lucide-react';
import { StoreReview, StoreSettings } from '@/types';
import { useBioMartStore } from '@/store/useStore';
import { DEFAULT_STORE_REVIEWS } from '@/lib/mock-data';

interface StoreReviewsProps {
  settings: StoreSettings;
  className?: string;
}

export const StoreReviews: React.FC<StoreReviewsProps> = ({ settings, className = '' }) => {
  const { language } = useBioMartStore();
  const isUz = language === 'uz';

  const isVisible = settings.show_reviews !== false && settings.theme_settings?.show_reviews !== false;

  // Initial reviews list
  const initialReviews: StoreReview[] =
    settings.reviews && settings.reviews.length > 0
      ? settings.reviews
      : DEFAULT_STORE_REVIEWS;

  const [reviewsList, setReviewsList] = useState<StoreReview[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isVisible) return null;

  // Calculate average
  const totalReviews = reviewsList.length;
  const avgRating =
    totalReviews > 0
      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newText.trim()) return;

    setIsSubmitting(true);

    const createdReview: StoreReview = {
      id: `rev-${Date.now()}`,
      author_name: newAuthor.trim(),
      rating: newRating,
      text: newText.trim(),
      date: isUz ? 'Hozirgina' : 'Только что',
      is_verified: true,
    };

    // Update local state
    setReviewsList((prev) => [createdReview, ...prev]);

    // Send Telegram alert to seller if configured
    try {
      if (settings.telegram_chat_id) {
        await fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '9023083705:AAHRnvV1ihvAENYcZiKW8UDn7cbD4iEMdm0'}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegram_chat_id,
            text: `⭐ Новый отзыв на витрине «${settings.store_name}»!\n\nАвтор: ${createdReview.author_name}\nОценка: ${'⭐'.repeat(createdReview.rating)}\nОтзыв: «${createdReview.text}»`,
          }),
        }).catch(() => null);
      }
    } catch {}

    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewAuthor('');
    setNewText('');
    setNewRating(5);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3500);
  };

  return (
    <section className={`px-3 py-4 mt-2 border-t border-border bg-page/50 ${className}`}>
      {/* Section Header with Average Rating */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary flex items-center gap-1.5">
            <span>{isUz ? 'Xaridorlar fikrlari' : 'Отзывы покупателей'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-soft text-accent font-semibold font-mono">
              {totalReviews}
            </span>
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-content-primary font-mono">{avgRating}</span>
            <span className="text-[11px] text-content-secondary">
              {isUz ? 'umumiy baho' : 'средняя оценка'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-btn text-xs font-semibold border border-border bg-surface hover:bg-surface-soft text-content-primary shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-accent" />
          <span>{isUz ? 'Fikr qoldirish' : 'Написать отзыв'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-2.5 mb-3 rounded-btn bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            {isUz
              ? 'Rahmat! Fikringiz muvaffaqiyatli saqlandi va vitrinada ko‘rinadi.'
              : 'Спасибо! Ваш отзыв опубликован на витрине.'}
          </span>
        </div>
      )}

      {/* Reviews Cards List */}
      <div className="space-y-2.5">
        {reviewsList.map((review) => (
          <div
            key={review.id}
            className="p-3 rounded-btn bg-surface border border-border shadow-2xs space-y-2 transition-colors hover:border-accent/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-content-primary">
                  {review.author_name}
                </span>
                {review.is_verified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{isUz ? 'Xaridor' : 'Покупатель'}</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-content-secondary">{review.date}</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-border text-border'
                  }`}
                />
              ))}
            </div>

            {/* Review text */}
            <p className="text-xs text-content-primary leading-relaxed whitespace-pre-line">
              {review.text}
            </p>
          </div>
        ))}
      </div>

      {/* Review Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-surface text-content-primary rounded-card border border-border p-5 shadow-card z-10 animate-slide-up-spring">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-[8px] bg-accent-soft text-accent flex items-center justify-center">
                  <Star className="w-4 h-4 fill-accent" />
                </span>
                <h4 className="text-sm font-bold text-content-primary">
                  {isUz ? 'Fikr qoldirish' : 'Оставить отзыв'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full border border-border bg-page hover:bg-surface-soft flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 pt-3.5">
              {/* Star Rating Select */}
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  {isUz ? 'Bahoingiz:' : 'Ваша оценка:'}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent text-content-secondary hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500 font-mono ml-1">
                    {newRating} / 5
                  </span>
                </div>
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  {isUz ? 'Ismingiz:' : 'Ваше имя:'} *
                </label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder={isUz ? 'Masalan, Dilnoza' : 'Например, Азиз'}
                  className="w-full px-3 py-2 rounded-btn text-xs border border-border bg-page text-content-primary focus:outline-none focus:border-accent"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  {isUz ? 'Fikringiz:' : 'Текст отзыва:'} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder={
                    isUz
                      ? 'Xarid va yetkazib berish haqida taassurotingizni yozing...'
                      : 'Напишите ваши впечатления о покупке, скорости доставки и качестве...'
                  }
                  className="w-full px-3 py-2 rounded-btn text-xs border border-border bg-page text-content-primary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-btn text-xs font-semibold border border-border bg-page hover:bg-surface-soft text-content-secondary"
                >
                  {isUz ? 'Bekor qilish' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-btn text-xs font-semibold bg-accent text-accent-text hover:brightness-95 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUz ? 'Yuborish' : 'Опубликовать'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
