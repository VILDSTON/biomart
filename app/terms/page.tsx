import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export const metadata = {
  title: 'Условия использования и Оферта — BioMart',
  description: 'Пользовательское соглашение и публичная оферта сервиса BioMart для продавцов и покупателей в Республике Узбекистан.',
};

export default function TermsPage() {
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
              <FileText className="w-3.5 h-3.5" />
              <span>Публичная оферта и правила сервиса</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Пользовательское соглашение BioMart
            </h1>
            <p className="text-xs text-[#6B6B66]">
              Редакция от 8 ноября 2026 г. • Действует на территории Республики Узбекистан
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-[#4A4A46] leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">1. Общие положения</h2>
            <p>
              1.1. Платформа <b>BioMart</b> (доступная по адресу <code>biomart.vercel.app</code>) представляет собой программный сервис создания мобильных онлайн-витрин (Link-in-Bio) для продавцов в социальных сетях (Instagram, Telegram).
            </p>
            <p>
              1.2. BioMart предоставляет технологическую инфраструктуру для каталогизации товаров, оформления заявок и отправки уведомлений в мессенджер Telegram.
            </p>
            <p>
              1.3. BioMart <b>не является продавцом товаров</b> и не выступает стороной в договорах купли-продажи между продавцами и их клиентами. Все обязательства по качеству, соответствию товаров, ценообразованию и доставке несут непосредственно владельцы соответствующих витрин.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-[#4A4A46] leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">2. Регистрация и правила для продавцов</h2>
            <p>
              2.1. Продавцом признается любое дееспособное физическое лицо, самозанятый гражданин либо юридическое лицо, зарегистрировавшее витрину на платформе BioMart.
            </p>
            <p>
              2.2. Запрещается размещение товаров, запрещенных к обороту законодательством Республики Узбекистан (включая оружие, наркотические средства, контрафактную продукцию, финансовые пирамиды и товары, нарушающие авторские права третьих лиц).
            </p>
            <p>
              2.3. Продавец обязуется указывать актуальные цены в сумах (UZS) и достоверные описания товаров.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-[#4A4A46] leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">3. Оформление заказов и оплата</h2>
            <p>
              3.1. Оформление заказа покупателем на витрине BioMart является предварительной заявкой на бронирование товара.
            </p>
            <p>
              3.2. Расчёты за товары осуществляются покупателем и продавцом напрямую удобным для них способом (наличными при доставке курьером, через банковские переводы Payme / Click / Uzum Pay или в магазине продавца).
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-[#4A4A46] leading-relaxed">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">4. Ответственность и поддержка</h2>
            <p>
              4.1. Сервис предоставляется на условиях «как есть» (as is). Администрация BioMart предпринимает все разумные меры для бесперебойной работы платформы и доставки сообщений в Telegram.
            </p>
            <p>
              4.2. По любым техническим вопросам, жалобам или предложениям пользователи могут обращаться в службу заботы через встроенную форму обратной связи или официального бота <code>@BioMartAssistant_bot</code>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
