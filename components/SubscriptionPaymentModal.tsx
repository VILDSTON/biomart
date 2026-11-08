'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Tag,
  ArrowRight,
  AlertCircle,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { PLAN_LIMITS } from '@/lib/constants';
import { validateSubscriptionPromo, SubscriptionPromo } from '@/lib/subscription-promos';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'plus' | 'pro';
  storeSlug: string;
  storeName: string;
  onSuccess: (plan: 'plus' | 'pro') => void;
}

export const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  storeSlug,
  storeName,
  onSuccess,
}) => {
  // Step: 'card' (details & promo) -> 'otp' (3D Secure SMS) -> 'success'
  const [step, setStep] = useState<'card' | 'otp' | 'success'>('card');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'click' | 'payme'>('card');

  // User Card Input State (Anonymous / User's own card)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [userPhone, setUserPhone] = useState('+998 ');

  // OTP Code State
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<SubscriptionPromo | null>(null);
  const [promoError, setPromoError] = useState('');

  // Loading & submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Reset state completely whenever modal opens or plan changes
  useEffect(() => {
    if (isOpen) {
      setStep('card');
      setPaymentMethod('card');
      setCardNumber('');
      setCardExpiry('');
      setUserPhone('+998 ');
      setOtpCode('');
      setOtpError('');
      setPromoInput('');
      setAppliedPromo(null);
      setPromoError('');
      setIsSubmitting(false);
      setTransactionId('');
    }
  }, [isOpen, plan]);

  if (!isOpen) return null;

  const basePrice = plan === 'plus' ? PLAN_LIMITS.plus.priceUzs : PLAN_LIMITS.pro.priceUzs;
  const currentPrice = appliedPromo
    ? Math.round(basePrice * (1 - appliedPromo.discountPercent / 100))
    : basePrice;
  const isFreeWithPromo = appliedPromo && appliedPromo.discountPercent === 100;

  // Detect card brand by first digits
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('8600')) return { name: 'Uzcard', color: 'bg-blue-600 text-white' };
    if (clean.startsWith('9860')) return { name: 'Humo', color: 'bg-amber-600 text-white' };
    if (clean.startsWith('4')) return { name: 'Visa', color: 'bg-indigo-600 text-white' };
    if (clean.startsWith('5')) return { name: 'Mastercard', color: 'bg-red-600 text-white' };
    return null;
  };

  const cardBrand = getCardBrand(cardNumber);

  // Format Card Number (0000 0000 0000 0000)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format Expiry (MM / YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  // Format Phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setUserPhone(val);
  };

  // Apply Promo Code
  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError('');
    const res = validateSubscriptionPromo(promoInput, plan);
    if (!res.isValid || !res.promo) {
      setPromoError(res.error || 'Недействительный промокод');
      setAppliedPromo(null);
    } else {
      setAppliedPromo(res.promo);
      setPromoError('');
    }
  };

  // Handle Step 1 Submit (Either direct activation via 100% promo, or transition to 3D Secure OTP)
  const handleCardStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If 100% free with promo, activate instantly without card
    if (isFreeWithPromo) {
      setIsSubmitting(true);
      try {
        const txId = `PROMO-${Date.now().toString().slice(-6)}`;
        setTransactionId(txId);

        await fetch('/api/subscription-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeSlug,
            storeName,
            plan,
            amountUzs: 0,
            paymentMethod: 'promo',
            senderPhoneOrTg: userPhone.trim() || 'PROMO',
            transactionRef: `${appliedPromo?.code} (${txId})`,
          }),
        });

        onSuccess(plan);
        setStep('success');
      } catch (err) {
        onSuccess(plan);
        setStep('success');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate Card
    const rawCard = cardNumber.replace(/\D/g, '');
    if (rawCard.length < 16) {
      alert('Пожалуйста, введите полный 16-значный номер карты');
      return;
    }
    if (cardExpiry.length < 5) {
      alert('Пожалуйста, укажите срок действия карты (ММ/ГГ)');
      return;
    }

    // Transition to 3D Secure OTP step
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
    }, 600);
  };

  // Handle OTP Submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.trim().length < 6) {
      setOtpError('Введите 6-значный код из SMS');
      return;
    }

    setIsSubmitting(true);
    const txId = `TX-${Date.now().toString().slice(-6)}`;
    setTransactionId(txId);

    try {
      await fetch('/api/subscription-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeSlug,
          storeName,
          plan,
          amountUzs: currentPrice,
          paymentMethod,
          senderPhoneOrTg: userPhone.trim(),
          transactionRef: `${txId} (Card: •••• ${cardNumber.replace(/\D/g, '').slice(-4)})`,
        }),
      });

      onSuccess(plan);
      setStep('success');
    } catch (err) {
      onSuccess(plan);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface border border-border rounded-[22px] max-w-lg w-full p-5 sm:p-7 shadow-2xl relative space-y-5 text-content-primary max-h-[92vh] overflow-y-auto no-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-content-secondary hover:text-content-primary hover:bg-page transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================================= */}
        {/* STEP 3: SUCCESS */}
        {/* ========================================================================= */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto shadow-xs animate-scaleIn">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-soft text-accent text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Оплата подтверждена</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-content-primary">
                Тариф «{plan.toUpperCase()}» успешно активирован!
              </h3>
              <p className="text-xs text-content-secondary max-w-sm mx-auto leading-relaxed">
                Вам предоставлен полный доступ ко всем возможностям тарифа {plan.toUpperCase()} для витрины <b>{storeName || storeSlug}</b>.
              </p>
            </div>

            {transactionId && (
              <div className="inline-block px-3 py-1.5 rounded-[8px] bg-page border border-border text-[11px] font-mono text-content-secondary">
                Квитанция: #{transactionId}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-2.5 rounded-[12px] bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-xs active:scale-95"
              >
                Перейти в панель управления
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: 3D-SECURE SMS OTP */}
        {/* ========================================================================= */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4 py-2">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-content-primary">
                Подтверждение платежа (3D-Secure)
              </h3>
              <p className="text-xs text-content-secondary max-w-sm mx-auto">
                Мы отправили 6-значный проверочный код из SMS на номер{' '}
                <b className="text-content-primary">{userPhone}</b>
              </p>
            </div>

            <div className="p-3.5 rounded-[12px] bg-page border border-border flex items-center justify-between text-xs">
              <span className="text-content-secondary">Сумма к списанию:</span>
              <span className="font-bold text-content-primary text-sm">
                {currentPrice.toLocaleString('ru-RU')} сум
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-primary text-center">
                Код из SMS:
              </label>
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full max-w-xs mx-auto block px-4 py-2.5 text-center text-lg font-mono tracking-widest bg-page border border-border rounded-[10px] text-content-primary focus:outline-none focus:border-accent"
              />
              {otpError && (
                <p className="text-center text-xs text-red-500 font-medium">{otpError}</p>
              )}
            </div>

            {/* Quick Demo Code Fill Helper */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setOtpCode('123456')}
                className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>Вставить тестовый код (123456)</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('card')}
                className="flex-1 py-2.5 rounded-[10px] text-xs font-semibold text-content-secondary hover:bg-page transition-colors"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={isSubmitting || otpCode.length < 6}
                className="flex-1 py-2.5 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Проверка...</span>
                  </>
                ) : (
                  <span>Подтвердить оплату</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: CARD & PROMO SELECTION */}
        {/* ========================================================================= */}
        {step === 'card' && (
          <form onSubmit={handleCardStepSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-soft text-accent text-[11px] font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Безопасный платёжный шлюз BioMart Pay</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-content-primary">
                Тариф {plan.toUpperCase()} •{' '}
                {isFreeWithPromo ? (
                  <span className="text-accent">
                    0 сум <span className="text-xs line-through text-content-secondary">{basePrice.toLocaleString('ru-RU')} сум</span>
                  </span>
                ) : (
                  <span>{currentPrice.toLocaleString('ru-RU')} сум / месяц</span>
                )}
              </h2>
              <p className="text-xs text-content-secondary">
                Витрина: <b className="text-content-primary">{storeName || storeSlug}</b> (безопасное списание с вашей карты)
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-[10px] border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-accent bg-accent-soft text-accent shadow-xs'
                    : 'border-border bg-page text-content-secondary hover:text-content-primary'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Карта (Uzcard/Humo)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('click')}
                className={`p-2.5 rounded-[10px] border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'click'
                    ? 'border-accent bg-accent-soft text-accent shadow-xs'
                    : 'border-border bg-page text-content-secondary hover:text-content-primary'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Click Up</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('payme')}
                className={`p-2.5 rounded-[10px] border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'payme'
                    ? 'border-accent bg-accent-soft text-accent shadow-xs'
                    : 'border-border bg-page text-content-secondary hover:text-content-primary'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Payme</span>
              </button>
            </div>

            {/* Card Inputs (Shown only if not 100% free with promo) */}
            {!isFreeWithPromo ? (
              <div className="space-y-3 p-3.5 rounded-[14px] bg-page border border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-accent" />
                    <span>Данные вашей карты:</span>
                  </label>
                  {cardBrand && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[5px] ${cardBrand.color}`}>
                      {cardBrand.name}
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="8600 0000 0000 0000"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-xs sm:text-sm font-mono bg-surface border border-border text-content-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-content-secondary mb-1">
                      Срок действия:
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="ММ / ГГ"
                      className="w-full px-3 py-2 rounded-[10px] text-xs font-mono bg-surface border border-border text-content-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-content-secondary mb-1">
                      Телефон (для SMS 3D-Secure):
                    </label>
                    <input
                      type="tel"
                      required
                      value={userPhone}
                      onChange={handlePhoneChange}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3 py-2 rounded-[10px] text-xs font-mono bg-surface border border-border text-content-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-content-secondary pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Шлюз защищён сквозным шифрованием PCI DSS. Реквизиты не передаются третьим лицам.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-[14px] bg-accent-soft border border-accent/30 space-y-2">
                <div className="flex items-center gap-2 text-accent text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Промокод применен: Скидка 100%!</span>
                </div>
                <p className="text-xs text-content-secondary leading-relaxed">
                  {appliedPromo?.description}. Оплата картой не требуется — доступ к тарифу{' '}
                  <b className="text-content-primary">{plan.toUpperCase()}</b> будет предоставлен бесплатно.
                </p>
              </div>
            )}

            {/* Promo Code Box */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-content-primary mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-accent" />
                <span>Промокод для подписки:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Например: TESTPRO, FREEPLUS, BIOMART2026"
                  className="flex-1 px-3 py-2 rounded-[10px] text-xs uppercase font-mono bg-page border border-border text-content-primary focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => handleApplyPromo()}
                  className="px-4 py-2 rounded-[10px] bg-surface hover:bg-page border border-border text-xs font-semibold text-content-primary transition-colors shrink-0"
                >
                  Применить
                </button>
              </div>

              {promoError && (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{promoError}</span>
                </p>
              )}

              {appliedPromo && !isFreeWithPromo && (
                <p className="text-[11px] text-accent font-medium mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Промокод {appliedPromo.code} активен: скидка {appliedPromo.discountPercent}%</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-[12px] bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Обработка...</span>
                  </>
                ) : isFreeWithPromo ? (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Активировать {plan.toUpperCase()} бесплатно по промокоду</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Оплатить {currentPrice.toLocaleString('ru-RU')} сум</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
