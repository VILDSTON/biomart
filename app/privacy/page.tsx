import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export const metadata = {
  title: 'Политика конфиденциальности — BioMart',
  description: 'Политика обработки персональных данных сервиса BioMart в соответствии с законодательством Республики Узбекистан.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-page text-content-primary">
      <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-lg text-content-primary">
            <BioMartLogo className="w-8 h-8" color="#1F7A5A" />
            <span>BioMart</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>На главную</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-surface border border-border rounded-[18px] p-6 sm:p-10 shadow-xs space-y-8">
          <div className="border-b border-border pb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-accent-soft text-accent text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Защита данных</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Политика конфиденциальности
            </h1>
            <p className="text-xs text-content-secondary">
              Соответствует Закону Республики Узбекистан «О персональных данных» № ЗРУ-547
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-content-primary">1. Какие данные мы обрабатываем</h2>
            <p>
              1.1. <b>Данные покупателей:</b> имя, контактный номер телефона, адрес доставки (при выборе курьерской доставки) и комментарий к заказу.
            </p>
            <p>
              1.2. <b>Данные продавцов:</b> адрес электронной почты, контактный телефон, Telegram username / Chat ID, ссылки на социальные сети (Instagram, Telegram).
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-content-primary">2. Цели сбора и обработки</h2>
            <p>
              2.1. Данные покупателя собираются исключительно для однократной передачи продавцу в целях доставки выбранного товара и связи по деталям заказа.
            </p>
            <p>
              2.2. Мы <b>не продаем, не передаем рекламным сетям и не рассылаем спам</b> по номерам телефонов покупателей или продавцов.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-content-primary">3. Хранение и защита данных</h2>
            <p>
              3.1. Все данные передаются по защищенному протоколу HTTPS с шифрованием TLS.
            </p>
            <p>
              3.2. База данных защищена строгими политиками безопасности на уровне строк (Row Level Security), предотвращающими несанкционированный доступ между продавцами.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-content-primary">4. Контакты службы поддержки</h2>
            <p>
              По вопросам удаления данных или исправления информации вы можете обратиться в поддержку через Telegram: <code>@BioMartAssistant_bot</code>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
