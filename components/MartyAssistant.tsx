'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  ShoppingBag,
  CheckCircle2,
  Phone,
  MessageSquare,
  Zap,
  Package,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Category, Order, OrderItem, Product, StoreSettings } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useBioMartStore } from '@/store/useStore';

interface MartyAssistantProps {
  storeSettings: StoreSettings;
  products: Product[];
  categories?: Category[];
  cartCount?: number;
  onAddToCart?: (product: Product, size?: string, quantity?: number) => void;
  onOrderCreated?: (order: Order) => void;
  floatingOffsetBottom?: string; // e.g. "bottom-20" when cart is visible
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProducts?: { id: string; title: string; price: number; image_url?: string }[];
  orderData?: any;
}

const STARTER_PROMPTS = [
  { label: '🔥 Что в наличии?', prompt: 'Привет! Покажи самые популярные товары в наличии.' },
  { label: '📏 Как выбрать размер?', prompt: 'Помоги подобрать размер одежды. Как они сидят?' },
  { label: '🚚 Условия доставки', prompt: 'Сколько стоит и как быстро доставляете по Ташкенту и Узбекистану?' },
  { label: '⚡ Хочу оформить заказ', prompt: 'Хочу оформить заказ. Что для этого нужно написать?' },
];

export const MartyAssistant: React.FC<MartyAssistantProps> = ({
  storeSettings,
  products,
  categories,
  cartCount = 0,
  onAddToCart,
  onOrderCreated,
  floatingOffsetBottom,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(50);
  const [remainingToday, setRemainingToday] = useState(50);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [createdOrders, setCreatedOrders] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { addShopOrder } = useBioMartStore();

  const storeName = storeSettings.store_name || (storeSettings as any).name || 'Tashkent Drip';
  const customAccent = storeSettings.accent_color || '#1F7A5A';

  // Initialize initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: `Здравствуйте! Я Марти (Marty) — ваш персональный AI-консультант в магазине «${storeName}». 🤖✨\n\nЯ отлично знаю весь каталог, помогу подобрать размер, расскажу про доставку или сразу приму ваш заказ прямо здесь в диалоге! Чем могу помочь?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [storeName]);

  // Small teaser tooltip after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('marty_teaser_dismissed');
      if (!dismissed && !isOpen) {
        setShowTeaser(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);
    setShowTeaser(false);

    try {
      const response = await fetch('/api/ai/marty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          shop: {
            slug: storeSettings.slug || 'tashkent_drip',
            name: storeName,
            description: storeSettings.description,
            city: (storeSettings as any).city || 'Ташкент',
            phone: storeSettings.phone || '',
            telegram_username: storeSettings.telegram_username || '',
          },
          products: products.map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            size_options: p.sizes || [],
            description: p.description || '',
            in_stock: p.in_stock,
          })),
        }),
      });

      const data = await response.json();

      if (data.dailyLimit !== undefined) setDailyLimit(data.dailyLimit);
      if (data.remainingToday !== undefined) setRemainingToday(data.remainingToday);

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            text:
              data.reply ||
              data.error ||
              'Извините, сейчас высокая нагрузка. Попробуйте еще раз через минуту или оформите заказ через корзину.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      // Check if order was created by Marty
      if (data.orderData && !createdOrders[data.orderData.customer_phone + data.orderData.title]) {
        processOrderCreation(data.orderData);
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Я здесь, чтобы помочь с любым вопросом!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: data.suggestedProducts,
        orderData: data.orderData,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: 'Связь немного прервалась. Вы всегда можете оформить заказ прямо через корзину на сайте! 🛍️',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // When Marty confirms an order, save it to Zustand & send Telegram notification!
  const processOrderCreation = async (orderPayload: any) => {
    try {
      const orderId = Math.floor(1000 + Math.random() * 9000);
      const matchedProduct = products.find(
        (p) => p.id === orderPayload.product_id || p.title.toLowerCase().includes((orderPayload.title || '').toLowerCase())
      );

      const unitPrice =
        matchedProduct?.price ||
        (typeof orderPayload.price === 'number' && orderPayload.price > 0 ? orderPayload.price : 200000);

      const items: OrderItem[] = [
        {
          product_id: matchedProduct?.id || orderPayload.product_id || 'p-ai-1',
          title: matchedProduct?.title || orderPayload.title || 'Товар из витрины',
          price: unitPrice,
          quantity: orderPayload.quantity || 1,
          size: orderPayload.size || null,
        },
      ];

      const newOrder: Order = {
        id: orderId,
        shop_slug: storeSettings.slug || 'tashkent_drip',
        customer_name: orderPayload.customer_name || 'Покупатель',
        customer_phone: orderPayload.customer_phone || '+998900000000',
        delivery_type: orderPayload.delivery_type === 'pickup' ? 'pickup' : 'delivery',
        address: orderPayload.address || 'Уточняется менеджером',
        comment: 'Оформлено через AI-консультанта Марти 🤖',
        items,
        total_price: unitPrice * (orderPayload.quantity || 1),
        status: 'new',
        created_at: new Date().toISOString(),
      };

      // 1. Dispatch to Zustand store
      addShopOrder(storeSettings.slug || 'tashkent_drip', newOrder);

      // 2. Trigger parent callback if provided
      if (onOrderCreated) {
        onOrderCreated(newOrder);
      }

      // 3. Mark processed
      setCreatedOrders((prev) => ({
        ...prev,
        [orderPayload.customer_phone + orderPayload.title]: true,
      }));

      // 4. Send to /api/orders for seller Telegram notification
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_slug: storeSettings.slug || 'tashkent_drip',
          seller_chat_id: storeSettings.telegram_chat_id,
          ...newOrder,
        }),
      }).catch((err) => console.warn('[Marty] Order notify error:', err));

      // 5. Confetti celebration!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    } catch (e) {
      console.warn('[Marty] Order process error:', e);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        text: `Диалог очищен. Чем могу помочь вам сейчас по ассортименту «${storeName}»? 💬`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING BUTTON & TEASER (Bottom-Right) */}
      {/* ========================================================================= */}
      <div
        className={`fixed z-40 transition-all duration-300 right-4 ${
          floatingOffsetBottom || (cartCount > 0 ? 'bottom-20 sm:bottom-6' : 'bottom-5 sm:bottom-6')
        }`}
      >
        {/* Teaser Bubble (appears after delay) */}
        {showTeaser && !isOpen && (
          <div className="absolute bottom-16 right-0 w-64 bg-surface border border-border shadow-xl rounded-2xl p-3 animate-slide-up text-left">
            <button
              onClick={() => {
                setShowTeaser(false);
                sessionStorage.setItem('marty_teaser_dismissed', '1');
              }}
              className="absolute top-2 right-2 p-1 text-content-secondary hover:text-content-primary rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-content-primary">Марти • AI Консультант</span>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              👋 Привет! Подскажу по размерам или приму заказ прямо здесь.
            </p>
            <button
              onClick={() => {
                setShowTeaser(false);
                setIsOpen(true);
              }}
              className="mt-2 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-accent text-white flex items-center justify-center gap-1.5 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Спросить Марти</span>
            </button>
          </div>
        )}

        {/* Floating Action Pill / Circle */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTeaser(false);
          }}
          aria-label="Открыть AI консультанта Марти"
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-surface border border-border/80 hover:border-accent text-content-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          style={{
            boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Avatar / Robot Icon with Pulse */}
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-emerald-400 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface animate-pulse" />
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-content-primary">Марти</span>
              <span className="text-[9px] px-1 py-0.2 rounded-sm bg-accent-soft text-accent font-semibold uppercase">
                AI
              </span>
            </div>
            <span className="text-[10px] text-content-secondary leading-none">Принимает заказы</span>
          </div>

          <Sparkles className="w-3.5 h-3.5 text-accent animate-spin-slow opacity-80" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHAT WINDOW / MODAL */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/40 backdrop-blur-xs animate-fade-in pointer-events-auto">
          {/* Backdrop for closing on outside click */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Chat Container */}
          <div
            className="relative z-10 w-full sm:max-w-[420px] h-[85dvh] sm:h-[620px] max-h-[750px] bg-surface border-t sm:border border-border sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-border bg-page/80 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-accent to-emerald-400 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-content-primary">Марти (Marty)</h3>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-accent-soft text-accent">
                      Flash-Lite
                    </span>
                  </div>
                  <p className="text-[11px] text-content-secondary truncate max-w-[190px]">
                    AI-консультант {storeName}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1">
                {/* Daily limit badge */}
                <div
                  title={`Осталось ${remainingToday} из ${dailyLimit} запросов на сегодня`}
                  className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-full bg-surface border border-border text-[10px] text-content-secondary font-mono"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>{remainingToday}/{dailyLimit}</span>
                </div>

                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Очистить диалог"
                  className="p-1.5 text-content-secondary hover:text-content-primary rounded-lg hover:bg-page transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Закрыть"
                  className="p-1.5 text-content-secondary hover:text-content-primary rounded-lg hover:bg-page transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-page/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-accent text-white rounded-br-xs'
                        : 'bg-surface border border-border text-content-primary rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Order Confirmation Card (if Marty created an order) */}
                    {msg.orderData && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-content-primary space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Заказ успешно принят!</span>
                        </div>
                        <div className="text-[11px] space-y-1 text-content-secondary">
                          <p>
                            <span className="font-semibold text-content-primary">Товар:</span>{' '}
                            {msg.orderData.title} {msg.orderData.size ? `(${msg.orderData.size})` : ''}
                          </p>
                          <p>
                            <span className="font-semibold text-content-primary">Получатель:</span>{' '}
                            {msg.orderData.customer_name} ({msg.orderData.customer_phone})
                          </p>
                          <p>
                            <span className="font-semibold text-content-primary">Адрес:</span>{' '}
                            {msg.orderData.address}
                          </p>
                          {msg.orderData.price && (
                            <p>
                              <span className="font-semibold text-content-primary">Сумма:</span>{' '}
                              {formatPrice(msg.orderData.price)}
                            </p>
                          )}
                        </div>
                        <div className="pt-1.5 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400">
                          <span>Уведомление в Telegram продавцу отправлено</span>
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      </div>
                    )}

                    {/* Suggested Products Mini Cards */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <span className="text-[10px] font-semibold text-content-secondary block">
                          Рекомендуемые товары:
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.suggestedProducts.map((sp) => {
                            const fullProd = products.find((p) => p.id === sp.id);
                            return (
                              <div
                                key={sp.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-page border border-border/70 text-content-primary"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {fullProd?.images?.[0] && (
                                    <div className="w-8 h-8 rounded-md bg-surface overflow-hidden relative shrink-0">
                                      <Image
                                        src={fullProd.images[0]}
                                        alt={sp.title}
                                        fill
                                        sizes="32px"
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="truncate">
                                    <p className="text-[11px] font-semibold truncate">{sp.title}</p>
                                    <p className="text-[10px] text-accent font-bold">
                                      {formatPrice(sp.price)}
                                    </p>
                                  </div>
                                </div>

                                {fullProd && onAddToCart && (
                                  <button
                                    onClick={() => onAddToCart(fullProd)}
                                    className="shrink-0 ml-2 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-accent text-white flex items-center gap-1 hover:brightness-105 active:scale-95 transition-all"
                                  >
                                    <ShoppingBag className="w-3 h-3" />
                                    <span>В корзину</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-content-secondary mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-content-secondary text-xs p-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center animate-pulse">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex gap-1 items-center bg-surface border border-border px-3 py-1.5 rounded-full shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] ml-1 text-content-secondary">Марти печатает...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Chips */}
            {messages.length <= 3 && !isLoading && (
              <div className="px-3 py-2 bg-surface border-t border-border flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                {STARTER_PROMPTS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip.prompt)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] bg-page hover:bg-accent-soft text-content-primary hover:text-accent border border-border hover:border-accent/40 transition-colors whitespace-nowrap"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input Bar */}
            <div className="p-3 border-t border-border bg-surface shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Спросите Марти или напишите данные для заказа..."
                    disabled={isLoading}
                    className="w-full text-xs py-2.5 pl-3 pr-8 rounded-btn bg-page border border-border text-content-primary placeholder:text-content-secondary/70 focus:outline-hidden focus:border-accent transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Отправить сообщение"
                  className="w-9 h-9 rounded-btn bg-accent text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-content-secondary px-1">
                <span>Google Studio Flash-Lite AI</span>
                <span>Лимит на сегодня: {remainingToday}/{dailyLimit}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
