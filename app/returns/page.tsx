import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export const metadata = {
  title: 'Возврат и обмен товаров — BioMart',
  description: 'Официальные правила возврата и обмена товаров в интернет-магазинах BioMart в соответствии с законодательством Республики Узбекистан.',
};

export default function ReturnsPage() {
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
              href="/shipping"
              className="text-xs font-medium text-content-secondary hover:text-content-primary transition-colors hidden sm:block"
            >
              Доставка и оплата
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
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Защита прав покупателей</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Политика возврата и обмена товаров
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            В магазинах платформы BioMart возврат и обмен товаров осуществляется в строгом соответствии с Законом Республики Узбекистан <b>«О защите прав потребителей»</b> (№ 221-I). Мы гарантируем прозрачную и честную процедуру возврата средств.
          </p>
        </div>

        {/* 14-Days Guarantee Banner */}
        <div className="p-5 sm:p-6 rounded-[20px] bg-gradient-to-r from-accent-soft/70 via-surface to-accent-soft/40 border border-accent/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                14
              </span>
              <h2 className="text-base font-bold text-content-primary">
                14 дней на возврат или обмен
              </h2>
            </div>
            <p className="text-xs text-content-secondary max-w-lg leading-relaxed">
              Вы имеете право вернуть или обменять непродовольственный товар надлежащего качества, если он не подошел по размеру, фасону, цвету или комплектации.
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-surface border border-border text-center shrink-0">
            <span className="text-[10px] text-content-secondary block">Срок возврата денег:</span>
            <span className="text-xs font-bold text-accent">1 – 3 рабочих дня</span>
          </div>
        </div>

        {/* Step-by-Step Return Process */}
        <div className="bg-surface border border-border rounded-[20px] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <span>Как оформить возврат за 3 простых шага</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-2">
              <div className="w-7 h-7 rounded-full bg-accent-soft text-accent text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="text-xs font-bold text-content-primary">Свяжитесь с магазином</h3>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                Напишите в Telegram продавца или оставьте заявку по номеру телефона витрины с указанием номера заказа.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-2">
              <div className="w-7 h-7 rounded-full bg-accent-soft text-accent text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="text-xs font-bold text-content-primary">Передайте товар</h3>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                Передайте товар курьеру в Ташкенте либо отправьте через ближайшее отделение службы BTS по регионам.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-border/80 space-y-2">
              <div className="w-7 h-7 rounded-full bg-accent-soft text-accent text-xs font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="text-xs font-bold text-content-primary">Получите деньги</h3>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                После быстрой проверки целостности средства возвращаются на карту Click, Payme или банковский счет.
              </p>
            </div>
          </div>
        </div>

        {/* Conditions by Product Category */}
        <div className="bg-surface border border-border rounded-[20px] p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-lg font-bold text-content-primary">
            Условия возврата по категориям товаров
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <div className="p-3.5 rounded-xl bg-page border border-border/70 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <h3 className="font-bold text-content-primary text-xs">Одежда, обувь и аксессуары</h3>
              </div>
              <p className="text-[11px] text-content-secondary">
                Подлежат возврату при условии, что вещь не была в употреблении, сохранены товарный вид, потребительские свойства, оригинальные бирки, навесные ярлыки и фабричная упаковка.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-page border border-border/70 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <h3 className="font-bold text-content-primary text-xs">Парфюмерия и селективная косметика</h3>
              </div>
              <p className="text-[11px] text-content-secondary">
                Возврат возможен только при сохранении герметичной заводской слюды и упаковки, либо при подтверждении заводского брака распылителя/флакона.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-page border border-border/70 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <h3 className="font-bold text-content-primary text-xs">Электроника и гаджеты</h3>
              </div>
              <p className="text-[11px] text-content-secondary">
                Обмениваются или возвращаются при наличии полной комплектации, гарантийного талона и отсутствии механических повреждений/следов вскрытия.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-content-primary space-y-1.5">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Товары, не подлежащие возврату (согласно законодательству РУз)</span>
              </div>
              <p className="text-[11px] text-content-secondary">
                Нательное белье, чулочно-носочные изделия, предметы личной гигиены надлежащего качества возврату и обмену не подлежат в целях санитарно-гигиенической безопасности.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
          <Link
            href="/shipping"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>← Перейти к условиям доставки и оплаты</span>
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn bg-accent text-white font-semibold text-xs shadow-xs hover:brightness-105 active:scale-95 transition-all"
          >
            <span>Перейти в витрину</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
