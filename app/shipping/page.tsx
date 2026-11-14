import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  Package,
  Zap,
  CheckCircle2,
  HelpCircle,
  Phone,
} from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export const metadata = {
  title: 'Доставка и оплата — BioMart',
  description: 'Условия доставки по Ташкенту и регионам Узбекистана. Способы оплаты: Click, Payme, наличными при получении.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-page text-content-primary">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-content-primary">
            <BioMartLogo className="w-8 h-8" color="#2ECC71" />
            <span>BioMart</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/returns"
              className="text-xs font-medium text-content-secondary hover:text-content-primary transition-colors hidden sm:block"
            >
              Возврат и обмен
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>На главную</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-smooth-in">
        {/* Title Card */}
        <div className="bg-surface border border-border rounded-[20px] p-6 sm:p-10 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>Логистика и доставка в Узбекистане</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Условия доставки и способы оплаты
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Мы делаем процесс покупки максимально комфортным: быстрая экспресс-доставка в день оформления по Ташкенту и надежная отправка через курьерские службы во все регионы Республики Узбекистан.
          </p>
        </div>

        {/* Section 1: Tashkent Express */}
        <div className="bg-surface border border-border rounded-[20px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">
                Экспресс-доставка по Ташкенту
              </h2>
              <p className="text-xs text-content-secondary">
                Яндекс Доставка & собственная курьерская служба
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-accent text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>1 – 2 часа</span>
              </div>
              <p className="text-xs text-content-primary font-semibold">Срок доставки</p>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                Отправляем курьера сразу после подтверждения заказа.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-accent text-xs font-bold">
                <Package className="w-4 h-4" />
                <span>20 000 – 35 000 сум</span>
              </div>
              <p className="text-xs text-content-primary font-semibold">Стоимость</p>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                Точный расчет по тарифу Яндекс Доставки до вашего адреса.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-accent text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Бесплатно</span>
              </div>
              <p className="text-xs text-content-primary font-semibold">От 500 000 сум</p>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                При покупке на сумму от 500 000 сум доставка за счет магазина.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-accent-soft/60 border border-accent/20 flex items-start gap-2.5 text-xs text-content-primary">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Примерка перед оплатой:</b> курьер ожидает до 15 минут, пока вы примерите одежду или обувь. Если размер не подошел, можно вернуть товар сразу курьеру.
            </p>
          </div>
        </div>

        {/* Section 2: Regional Delivery */}
        <div className="bg-surface border border-border rounded-[20px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">
                Доставка по регионам Узбекистана
              </h2>
              <p className="text-xs text-content-secondary">
                12 вилоятов и Республика Каракалпакстан через BTS Post & Fargo
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <p>
              Мы отправляем заказы надежными курьерскими службами <b>BTS Express</b> и <b>Fargo Parcel Service</b>. Вы можете выбрать доставку до двери или забрать посылку в ближайшем пункте выдачи в вашем городе.
            </p>

            <ul className="space-y-2 pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span><b>Сроки:</b> 1–2 рабочих дня в крупные города (Самарканд, Бухара, Андижан, Наманган, Фергана, Нукус, Карши, Навои, Термез, Ургенч). В отдаленные районы — до 3 дней.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span><b>Тариф:</b> от 30 000 до 45 000 сум в зависимости от веса посылки и региона.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span><b>Трекинг посылки:</b> трек-номер отправляется в ваш Telegram и по SMS сразу после передачи посылки курьеру.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3: Payment Methods */}
        <div className="bg-surface border border-border rounded-[20px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">
                Способы оплаты
              </h2>
              <p className="text-xs text-content-secondary">
                Безопасные платежи в национальной валюте (UZS)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-primary">Click & Click Evolution</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold">0% комиссии</span>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                Оплата через приложение Click, по QR-коду или через выставленный счет на ваш номер телефона.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-primary">Payme & Payme GO</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold">0% комиссии</span>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                Быстрая оплата картами Uzcard и Humo через приложение Payme за 1 клик.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-primary">Наличными курьеру</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-page text-content-secondary font-semibold border border-border">При получении</span>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                Оплачивайте наличными или прямым переводом на карту курьера после осмотра и примерки товара.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-primary">Uzum Bank / Visa / Mastercard</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-page text-content-secondary font-semibold border border-border">Онлайн</span>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                Прямая онлайн-оплата банковскими картами резидентов и нерезидентов Узбекистана.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn bg-accent text-white font-semibold text-xs shadow-xs hover:brightness-105 active:scale-95 transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Перейти к покупкам в демо-витрине</span>
          </Link>
          <Link
            href="/returns"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>Ознакомиться с правилами возврата</span>
            <span>→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
