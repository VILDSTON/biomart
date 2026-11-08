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
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A1A1A]">
      <header className="sticky top-0 z-20 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[#E7E4DC]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[1px] font-bold text-lg text-[#1A1A1A]">
            <BioMartLogo className="w-9 h-9" color="#1F7A5A" />
            <span>BioMart</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1F7A5A] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>На главную</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-[#FFFFFF] border border-[#E7E4DC] rounded-[16px] p-6 sm:p-10 shadow-xs space-y-8">
          <div className="border-b border-[#E7E4DC] pb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#E4F1EB] text-[#1F7A5A] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Защита данных</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Политика конфиденциальности
            </h1>
            <p className="text-xs text-[#6B6B66]">
              Соответствует Закону Республики Узбекистан «О персональных данных» № ЗРУ-547
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-[#4A4A46] leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">1. Какие данные мы обрабатываем</h2>
            <p>
              1.1. <b>Данные покупателей:</b> имя, контактный номер телефона, адрес доставки (при выборе курьерской доставки) и комментарий к заказу.
            </p>
            <p>
              1.2. <b>Данные продавцов:</b> адрес электронной почты, контактный телефон, Telegram username / Chat ID, ссылки на социальные сети (Instagram, Telegram).
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-[#4A4A46] leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">2. Цели сбора и обработки</h2>
            <p>
              2.1. Данные покупателя собираются исключительно для однократной передачи продавцу в целях доставки выбранного товара и связи по деталям заказа.
            </p>
            <p>
              2.2. Мы <b>не продаем, не передаем рекламным сетям и не рассылаем спам</b> по номерам телефонов покупателей или продавцов.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-[#4A4A46] leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">3. Хранение и защита данных</h2>
            <p>
              3.1. Все данные передаются по защищенному протоколу HTTPS с шифрованием TLS.
            </p>
            <p>
              3.2. База данных защищена строгими политиками безопасности на уровне строк (Row Level Security), предотвращающими несанкционированный доступ между продавцами.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-[#4A4A46] leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">4. Контакты службы поддержки</h2>
            <p>
              По вопросам удаления данных или исправления информации вы можете обратиться в поддержку через Telegram: <code>@BioMartAssistant_bot</code>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
