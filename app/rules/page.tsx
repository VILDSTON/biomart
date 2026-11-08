import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { BioMartLogo } from '@/components/BioMartLogo';

export const metadata = {
  title: 'Правила платформы и модерации — BioMart',
  description: 'Правила размещения товаров, требования безопасности и модерации витрин в BioMart.',
};

export default function RulesPage() {
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
              <Shield className="w-3.5 h-3.5" />
              <span>Стандарты безопасности BioMart</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Правила платформы и модерации витрин
            </h1>
            <p className="text-xs text-content-secondary">
              Действует для всех продавцов и магазинов на территории Республики Узбекистан
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-xs flex items-center justify-center font-bold">1</span>
              <span>Обязательная модерация витрин</span>
            </h2>
            <p>
              Каждая создаваемая или редактируемая витрина на платформе BioMart проходит автоматическую и ручную проверку службой безопасности. Витрины со статусом <code>pending</code> становятся доступны публично только после одобрения модератором.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-600 text-xs flex items-center justify-center font-bold">2</span>
              <span>Категорически запрещенные товары и контент</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><b>Наркотические, психотропные вещества</b>, их прекурсоры, курительные смеси и принадлежности.</li>
              <li><b>Оружие</b> любого типа (огнестрельное, холодное, травматическое), боеприпасы и взрывчатка.</li>
              <li><b>Табачная продукция</b>, электронные сигареты, жидкости для вейпов и устройства нагревания табака без лицензии.</li>
              <li><b>Материалы сексуального характера</b>, порнография и интимные услуги.</li>
              <li><b>Мошеннические схемы</b>, финансовые пирамиды, сомнительные «инвестиции» и ссылки на азартные игры/казино.</li>
              <li><b>Нецензурная брань</b>, мат, оскорбления, призывы к насилию и дискриминации.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-xs flex items-center justify-center font-bold">3</span>
              <span>Блокировка и ответственность</span>
            </h2>
            <p>
              В случае обнаружения нарушений или подтверждения жалобы покупателя:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Витрина немедленно переводится в статус <code>rejected</code> (покупатели видят экран «Временно недоступна»).</li>
              <li>Номер телефона и адрес витрины (slug) вносятся в чёрный список платформы. Владелец не сможет зарегистрировать новую витрину на эти реквизиты.</li>
              <li>При подозрении на уголовные правонарушения (мошенничество, контрабанда) данные передаются в правоохранительные органы.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-xs flex items-center justify-center font-bold">4</span>
              <span>Жалобы и защита покупателей</span>
            </h2>
            <p>
              На каждой витрине и в карточке любого товара установлена кнопка <b>«Пожаловаться»</b>. Все обращения регистрируются и проверяются дежурным администратором в течение 2 часов.
            </p>
          </section>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-content-secondary">
            <span>BioMart Platform • Узбекистан</span>
            <Link href="/terms" className="text-accent hover:underline font-semibold">
              Пользовательское соглашение →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
