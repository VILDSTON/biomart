'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Lock,
  LogOut,
  Send,
  Phone,
  RefreshCw,
  Check,
  AlertTriangle,
  Palette,
  Sun,
  Moon,
  LayoutGrid,
  List,
  QrCode as QrIcon,
  HelpCircle,
  ShieldCheck,
  Copy,
  Download,
  Instagram,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  MapPin,
  Tag,
  Edit3,
  Upload,
  Image as ImageIcon,
  Wand2,
  X,
  Truck,
  Store,
  MessageSquare,
  Bot,
  MoreVertical,
} from 'lucide-react';
import { useBioMartStore } from '@/store/useStore';
import { ACCENT_COLOR_PRESETS } from '@/lib/mock-data';
import { QRCodeCard } from '@/components/QRCodeCard';
import { StoriesGeneratorModal } from '@/components/StoriesGeneratorModal';
import { StorefrontDesignEditor } from '@/components/StorefrontDesignEditor';
import { BioMartLogo } from '@/components/BioMartLogo';
import { CatalogLayout, Category, Order, Product, StoreSettings, ThemeMode, PlanType } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { SupportModal } from '@/components/SupportModal';

const AVATAR_PRESETS = [
  { name: 'Streetwear & Стиль', url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80', label: 'Одежда' },
  { name: 'Кроссовки & Обувь', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80', label: 'Обувь' },
  { name: 'Парфюмерия & Селектив', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80', label: 'Парфюм' },
  { name: 'Косметика & Бьюти', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80', label: 'Бьюти' },
  { name: 'Сладости & Десерты', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', label: 'Десерты' },
  { name: 'Аксессуары & Украшения', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80', label: 'Украшения' },
];

function cleanDisplayAiText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-=_]{2,}\s*$/gm, '')
    .replace(/\|/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

type DashboardTab = 'orders' | 'products' | 'share' | 'telegram' | 'branding' | 'design' | 'tariff' | 'ai';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sessionStorage.getItem('biomart_admin_auth') === 'true' || sp.get('auth') === 'demo';
    }
    return true;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const tab = sp.get('tab') as DashboardTab;
      if (['orders', 'products', 'share', 'telegram', 'branding', 'design', 'tariff', 'ai'].includes(tab)) return tab;
    }
    return 'orders';
  });
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState<'billing' | 'bug' | 'orders' | 'feature' | 'other'>('bug');
  const [language, setLanguage] = useState<'ru' | 'uz'>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const lang = sp.get('lang');
      if (lang === 'uz' || lang === 'ru') return lang;
    }
    return 'ru';
  });

  // New feature states
  const [selectedStoriesProduct, setSelectedStoriesProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ordersPeriod, setOrdersPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState('10');

  // Edit Product Modal State
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    const cat = addShopCategory(activeSlug, newCategoryInput.trim());
    setNewCategoryInput('');
    showToast(`Категория «${cat.name}» создана`);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (catId === 'cat-all') return;
    deleteShopCategory(activeSlug, catId);
    showToast(`Категория «${catName}» удалена`);
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOldPrice, setEditOldPrice] = useState('');
  const [editVariantType, setEditVariantType] = useState('Размер');
  const [editSizes, setEditSizes] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInStock, setEditInStock] = useState<boolean>(true);
  const [editFormError, setEditFormError] = useState('');

  // Groq AI Assistant State (Pro Feature)
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Привет! Я бизнес-ассистент BioMart. Могу составить продающие тексты для товаров, придумать акции для Stories или помочь с доставкой в Узбекистане. Чем могу помочь?',
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Zustand Store
  const {
    activeSlug,
    setActiveSlug,
    getShopData,
    updateShopSettings,
    addShopProduct,
    updateShopProduct,
    duplicateShopProduct,
    toggleShopProductStock,
    deleteShopProduct,
    updateShopOrderStatus,
    addShopCategory,
    deleteShopCategory,
    resetDemoData,
    shops,
  } = useBioMartStore();

  const currentShop = getShopData(activeSlug);
  const { settings, products, categories, orders } = currentShop;

  // New Product Form State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOldPrice, setNewOldPrice] = useState('');
  const [newVariantType, setNewVariantType] = useState('Размер');
  const [newSizes, setNewSizes] = useState('S, M, L, XL');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [tgSavedToast, setTgSavedToast] = useState(false);

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    setIsClient(true);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const authSession = sessionStorage.getItem('biomart_admin_auth');
    if (authSession === 'true' || searchParams?.get('auth') === 'demo') {
      setIsAuthenticated(true);
    }
    const tabParam = searchParams?.get('tab') as DashboardTab | null;
    if (tabParam && ['orders', 'products', 'share', 'telegram', 'branding', 'design', 'tariff', 'ai'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const langParam = searchParams?.get('lang') as 'ru' | 'uz' | null;
    if (langParam === 'ru' || langParam === 'uz') {
      setLanguage(langParam);
    }
    const savedSlug = sessionStorage.getItem('biomart_current_slug');
    if (savedSlug && shops[savedSlug]) {
      setActiveSlug(savedSlug);
    }
  }, [shops, setActiveSlug]);

  useEffect(() => {
    if (settings) {
      const sanitized = {
        ...settings,
        description: settings.description?.includes('Добро пожаловать в наш магазин') ? '' : (settings.description || '')
      };
      setSettingsForm(sanitized);
    }
  }, [settings]);

  useEffect(() => {
    if (categories.length > 0 && !newCategoryId) {
      const firstRealCat = categories.find((c) => c.slug !== 'all') || categories[0];
      setNewCategoryId(firstRealCat.id);
    }
  }, [categories, newCategoryId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123' || passwordInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('biomart_admin_auth', 'true');
    } else {
      setAuthError('Неверный пароль. Пароль по умолчанию: admin123');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('biomart_admin_auth');
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Plan Limits
  const planLimits: Record<PlanType, number> = {
    start: 10,
    plus: 100,
    pro: Infinity,
  };
  const currentPlan: PlanType = (settings.plan as PlanType) || 'start';
  const maxProducts = planLimits[currentPlan] || 10;
  const isLimitReached = products.length >= maxProducts;
  const isProPlan = currentPlan === 'pro';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Размер файла превышает 5 МБ');
      return;
    }
    showToast('Загрузка фото в облако...');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', `products/${activeSlug}`);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
      setter(data.url);
      showToast('Фото успешно сохранено в облако!');
    } catch (err: any) {
      console.warn('Upload fallback to local preview:', err);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          setter(ev.target.result);
          showToast('Фото загружено');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isLimitReached) {
      setFormError(
        `Вы достигли лимита ${maxProducts} товаров для тарифа ${currentPlan.toUpperCase()}. Перейдите на Plus или Pro для увеличения лимита.`
      );
      return;
    }

    if (!newTitle.trim()) {
      setFormError('Укажите название товара');
      return;
    }

    const priceNum = parseFloat(newPrice.replace(/\s+/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Укажите корректную цену');
      return;
    }

    const oldPriceNum = newOldPrice.trim()
      ? parseFloat(newOldPrice.replace(/\s+/g, ''))
      : null;

    const sizesArray = newSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const imageUrl =
      newImageUrl.trim() ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

    addShopProduct(activeSlug, {
      title: newTitle.trim(),
      category_id: newCategoryId,
      price: priceNum,
      old_price: oldPriceNum,
      variant_type: sizesArray.length > 0 ? newVariantType : '',
      sizes: sizesArray,
      images: [imageUrl],
      description: newDescription.trim(),
      in_stock: true,
    });

    setNewTitle('');
    setNewPrice('');
    setNewOldPrice('');
    setNewSizes('S, M, L, XL');
    setNewImageUrl('');
    setNewDescription('');
    setIsAddProductOpen(false);
    showToast(`Товар «${newTitle.trim()}» добавлен`);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditTitle(prod.title);
    setEditCategoryId(prod.category_id || categories[0]?.id || '');
    setEditPrice(String(prod.price));
    setEditOldPrice(prod.old_price ? String(prod.old_price) : '');
    setEditVariantType(prod.variant_type || 'Размер');
    setEditSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setEditImageUrl(prod.images?.[0] || '');
    setEditDescription(prod.description || '');
    setEditInStock(prod.in_stock !== false);
    setEditFormError('');
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditFormError('');

    if (!editTitle.trim()) {
      setEditFormError('Укажите название товара');
      return;
    }

    const priceNum = parseFloat(editPrice.replace(/\s+/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      setEditFormError('Укажите корректную цену');
      return;
    }

    const oldPriceNum = editOldPrice.trim()
      ? parseFloat(editOldPrice.replace(/\s+/g, ''))
      : null;

    const sizesArray = editSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const imageUrl =
      editImageUrl.trim() ||
      editingProduct.images?.[0] ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

    updateShopProduct(activeSlug, editingProduct.id, {
      title: editTitle.trim(),
      category_id: editCategoryId,
      price: priceNum,
      old_price: oldPriceNum,
      variant_type: sizesArray.length > 0 ? editVariantType : '',
      sizes: sizesArray,
      images: [imageUrl],
      description: editDescription.trim(),
      in_stock: editInStock,
    });

    setEditingProduct(null);
    showToast(`Товар «${editTitle.trim()}» обновлен`);
  };

  const handleGenerateAiDescription = async (mode: 'new' | 'edit') => {
    const title = mode === 'new' ? newTitle : editTitle;
    const catId = mode === 'new' ? newCategoryId : editCategoryId;

    if (!title.trim()) {
      showToast('Сначала введите название товара');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const catName = categories.find((c) => c.id === catId)?.name || 'Товары';
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category: catName,
          language: 'ru',
        }),
      });

      const data = await res.json();
      if (data.success && data.description) {
        if (mode === 'new') {
          setNewDescription(data.description);
        } else {
          setEditDescription(data.description);
        }
        showToast('Описание товара сгенерировано');
      } else {
        showToast(data.error || 'Не удалось сгенерировать описание');
      }
    } catch (err: any) {
      console.error('AI assistant error:', err);
      showToast('Ошибка вызова ассистента описаний');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSendAiMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || aiInput).trim();
    if (!textToSend || isAiLoading) return;

    if (currentPlan !== 'pro') {
      showToast('AI-Ассистент доступен только на тарифе Pro');
      setActiveTab('tariff');
      return;
    }

    const newMessages = [...aiMessages, { role: 'user' as const, content: textToSend }];
    setAiMessages(newMessages);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/groq-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          plan: currentPlan,
          storeName: settings.store_name,
          category: categories.find((c) => c.slug !== 'all')?.name || categories[0]?.name || '',
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setAiMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        showToast(data.error || 'Ошибка вызова AI-Ассистента');
      }
    } catch (err: any) {
      console.error('Groq AI error:', err);
      showToast('Не удалось связаться с AI-Ассистентом');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDuplicateProduct = (prod: Product) => {
    if (isLimitReached) {
      showToast(
        `Достигнут лимит товаров (${maxProducts}) для тарифа ${currentPlan.toUpperCase()}. Перейдите на тариф Plus или Pro.`
      );
      return;
    }
    const cloned = duplicateShopProduct(activeSlug, prod.id);
    showToast(`Товар «${prod.title}» дублирован`);
    if (cloned) {
      openEditModal(cloned);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings(activeSlug, settingsForm);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings(activeSlug, {
      telegram_chat_id: settingsForm.telegram_chat_id,
    });
    setTgSavedToast(true);
    setTimeout(() => setTgSavedToast(false), 2500);
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const cleanCode = newPromoCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const percent = Math.min(100, Math.max(1, parseInt(newPromoPercent) || 10));

    const existingCodes = settingsForm.promo_codes || [];
    const updated = [
      ...existingCodes.filter((c) => c.code !== cleanCode),
      { code: cleanCode, discount_percent: percent, active: true },
    ];
    setSettingsForm({ ...settingsForm, promo_codes: updated });
    updateShopSettings(activeSlug, { promo_codes: updated });
    setNewPromoCode('');
    showToast(`Промокод ${cleanCode} (-${percent}%) добавлен`);
  };

  const handleDeletePromo = (codeToDelete: string) => {
    const existingCodes = settingsForm.promo_codes || [];
    const updated = existingCodes.filter((c) => c.code !== codeToDelete);
    setSettingsForm({ ...settingsForm, promo_codes: updated });
    updateShopSettings(activeSlug, { promo_codes: updated });
    showToast(`Промокод ${codeToDelete} удалён`);
  };

  // Orders period filter
  const getOrdersByPeriod = () => {
    const now = Date.now();
    return orders.filter((o) => {
      // 1. Status filter
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;

      // 2. Period filter
      if (ordersPeriod === 'all') return true;
      const orderTime = new Date(o.created_at).getTime();
      const diffHours = (now - orderTime) / (1000 * 60 * 60);

      if (ordersPeriod === 'today') return diffHours <= 24;
      if (ordersPeriod === 'week') return diffHours <= 24 * 7;
      if (ordersPeriod === 'month') return diffHours <= 24 * 30;
      return true;
    });
  };

  const filteredOrders = getOrdersByPeriod();

  // Excel / CSV Export (Supports CSV and Excel-native XLS format)
  const handleExportOrdersToExcel = (formatType: 'csv' | 'xls' = 'csv') => {
    if (!isProPlan) {
      showToast(
        'Экспорт заказов в Excel (.xlsx/.csv) доступен на тарифе Pro. Перейдите во вкладку «Дизайн», чтобы выбрать Pro.'
      );
      return;
    }

    if (filteredOrders.length === 0) {
      alert('За выбранный период заказов нет.');
      return;
    }

    if (formatType === 'xls') {
      const tableRows = filteredOrders
        .map((o) => {
          const itemsList = o.items
            .map((it) => `${it.title}${it.size ? ` (${it.size})` : ''} x${it.quantity}`)
            .join(', ');
          const statusText =
            o.status === 'new'
              ? 'Новый'
              : o.status === 'completed'
              ? 'Выполнен'
              : 'Отменён';
          const deliveryText = o.delivery_type === 'delivery' ? 'Доставка' : 'Самовывоз';
          return `<tr>
            <td>${o.id}</td>
            <td>${formatDate(o.created_at)}</td>
            <td>${o.customer_name}</td>
            <td>${o.customer_phone}</td>
            <td>${deliveryText}</td>
            <td>${o.address || '—'}</td>
            <td>${itemsList}</td>
            <td>${o.total_price}</td>
            <td>${o.promo_code || '—'}</td>
            <td>${statusText}</td>
            <td>${o.comment || '—'}</td>
          </tr>`;
        })
        .join('');

      const htmlContent = `<html><head><meta charset="utf-8"></head><body><table border="1">
        <tr style="background:#111827;color:#fff;font-weight:bold">
          <th>ID Заказа</th>
          <th>Дата и время</th>
          <th>Имя клиента</th>
          <th>Телефон</th>
          <th>Способ доставки</th>
          <th>Адрес доставки</th>
          <th>Состав заказа</th>
          <th>Сумма (сум)</th>
          <th>Промокод</th>
          <th>Статус</th>
          <th>Комментарий</th>
        </tr>
        ${tableRows}
      </table></body></html>`;

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biomart_orders_${activeSlug}_${ordersPeriod}_${new Date().toISOString().slice(0, 10)}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Экспорт отчета в Excel (.xls) завершен');
      return;
    }

    const bom = '\uFEFF';
    const headers = [
      'ID Заказа',
      'Дата и время',
      'Имя клиента',
      'Телефон',
      'Способ доставки',
      'Адрес доставки',
      'Состав заказа',
      'Сумма заказа (сум)',
      'Промокод',
      'Статус',
      'Комментарий',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = filteredOrders.map((o) => {
      const itemsList = o.items
        .map((it) => `${it.title}${it.size ? ` (${it.size})` : ''} x${it.quantity}`)
        .join('; ');
      const statusText =
        o.status === 'new'
          ? 'Новый'
          : o.status === 'completed'
          ? 'Выполнен'
          : 'Отменён';
      const deliveryText = o.delivery_type === 'delivery' ? 'Доставка' : 'Самовывоз';

      return [
        escapeCsv(o.id),
        escapeCsv(formatDate(o.created_at)),
        escapeCsv(o.customer_name),
        escapeCsv(o.customer_phone),
        escapeCsv(deliveryText),
        escapeCsv(o.address || '—'),
        escapeCsv(itemsList),
        escapeCsv(o.total_price),
        escapeCsv(o.promo_code || '—'),
        escapeCsv(statusText),
        escapeCsv(o.comment || '—'),
      ].join(';');
    });

    const csvContent = bom + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biomart_orders_${activeSlug}_${ordersPeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Экспорт отчета в CSV завершен');
  };

  // Analytics Metrics
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_price, 0);
  const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  const conversionRate = orders.length > 0 ? Math.round((completedOrdersCount / orders.length) * 100) : 0;

  // Top Products calculation
  const productSalesMap: Record<string, { title: string; count: number; revenue: number }> = {};
  validOrders.forEach((o) => {
    o.items.forEach((it) => {
      if (!productSalesMap[it.title]) {
        productSalesMap[it.title] = { title: it.title, count: 0, revenue: 0 };
      }
      productSalesMap[it.title].count += it.quantity;
      productSalesMap[it.title].revenue += it.price * it.quantity;
    });
  });
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (!isClient) return null;

  // Password Protection Gate
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-page text-content-primary flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface rounded-[14px] p-6 sm:p-8 shadow-xs border border-border">
          <div className="w-10 h-10 rounded-[10px] bg-[#E4F1EB] text-[#1F7A5A] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>

          <h1 className="text-xl font-semibold text-center text-content-primary tracking-tight">
            Личный кабинет продавца
          </h1>
          <p className="text-xs text-center text-content-secondary mt-1 mb-5">
            Введите пароль для управления магазином biomart.vercel.app/{activeSlug}
          </p>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <input
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Пароль администратора"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-[10px] text-xs focus:outline-none focus:border-[#1F7A5A] text-content-primary font-mono"
              />
            </div>

            {authError && (
              <p className="text-xs text-[#C2410C] font-medium text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1F7A5A] hover:bg-[#17634A] text-white font-medium text-xs rounded-[10px] transition-colors"
            >
              Войти в кабинет
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-content-secondary">
            <span>Пароль по умолчанию:</span>
            <code className="bg-page text-[#1F7A5A] px-2 py-0.5 rounded-[6px] font-mono font-medium border border-border">
              admin123
            </code>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-xs text-content-secondary hover:text-content-primary inline-flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Вернуться на главную страницу
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="min-h-screen bg-page text-content-primary">
      {/* PC Expanded Container: max-w-3xl */}
      <main className={`mx-auto min-h-screen bg-page flex flex-col border-x border-border ${activeTab === 'branding' || activeTab === 'design' ? 'max-w-6xl' : 'max-w-3xl'}`}>

        {/* Top Header: Clean Light Style */}
        <header className="bg-surface text-content-primary border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/${activeSlug}`}
              className="w-8 h-8 rounded-[10px] bg-page hover:bg-[#E7E4DC] flex items-center justify-center text-content-primary border border-border transition-colors"
              title="Открыть витрину"
              aria-label="Открыть витрину"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Store Avatar in Header */}
            <div className="relative w-8 h-8 rounded-[10px] overflow-hidden bg-page border border-border shrink-0">
              {settings.avatar_url ? (
                <Image
                  src={settings.avatar_url}
                  alt={settings.store_name}
                  fill
                  className="object-cover"
                  sizes="32px"
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-white bg-[#1F7A5A]"
                >
                  {(settings.store_name || 'BM').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-semibold tracking-tight leading-none text-content-primary truncate max-w-[130px] sm:max-w-[220px]">
                  {settings.store_name}
                </h1>
                <button
                  type="button"
                  onClick={() => setActiveTab('tariff')}
                  className="text-[10px] bg-[#E4F1EB] text-[#1F7A5A] border border-[#1F7A5A]/20 px-2 py-0.5 rounded-[6px] font-medium uppercase hover:bg-[#1F7A5A]/10 transition-colors cursor-pointer shrink-0"
                  title="Управление тарифом"
                >
                  {settings.plan || 'Start'}
                </button>
              </div>
              <span className="text-[10px] text-content-secondary font-mono block truncate max-w-[150px] sm:max-w-none">
                biomart.vercel.app/{activeSlug}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setSupportCategory('bug');
                setIsSupportOpen(true);
              }}
              className="text-xs bg-[#E4F1EB] hover:bg-[#d5eade] text-[#1F7A5A] border border-[#1F7A5A]/20 px-2.5 py-1.5 rounded-[10px] flex items-center gap-1 font-medium transition-colors shrink-0"
              title="Поддержка и связь с основателем"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Поддержка</span>
            </button>

            <Link
              href={`/${activeSlug}`}
              target="_blank"
              className="text-xs bg-surface hover:bg-page text-content-primary border border-border px-2.5 sm:px-3 py-1.5 rounded-[10px] flex items-center gap-1 font-medium transition-colors shrink-0"
              title="Открыть витрину"
            >
              <span className="hidden sm:inline">Открыть витрину</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 text-content-secondary hover:text-content-primary rounded-[10px] transition-colors shrink-0"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-surface border-b border-border p-1.5 sticky top-[53px] z-20">
          <button
            onClick={() => setActiveTab('orders')}
            className={`relative flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#1F7A5A] text-white shadow-xs'
                : 'text-content-secondary hover:bg-page hover:text-content-primary'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Заказы</span>
            {newOrdersCount > 0 && (
              <span className="bg-surface text-[#1F7A5A] text-[10px] px-1.5 py-0.2 rounded-full font-semibold ml-0.5">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#1F7A5A] text-white shadow-xs'
                : 'text-content-secondary hover:bg-page hover:text-content-primary'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Товары ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'share'
                ? 'bg-[#1F7A5A] text-white shadow-xs'
                : 'text-content-secondary hover:bg-page hover:text-content-primary'
            }`}
          >
            <QrIcon className="w-3.5 h-3.5" />
            <span>Поделиться</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'telegram'
                ? 'bg-[#1F7A5A] text-white shadow-xs'
                : 'text-content-secondary hover:bg-page hover:text-content-primary'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'branding'
                ? 'bg-[#1F7A5A] text-white shadow-xs'
                : 'text-content-secondary hover:bg-page hover:text-content-primary'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Дизайн</span>
          </button>

          <button
            onClick={() => setActiveTab('tariff')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'tariff'
                ? 'bg-[#1F7A5A] text-white shadow-xs'
                : 'text-content-secondary hover:bg-page hover:text-content-primary'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Тариф</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'ai'
                ? 'bg-[#1F7A5A] text-white shadow-xs'
                : 'text-[#1F7A5A] hover:bg-[#E4F1EB]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI (Pro)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSupportCategory('bug');
              setIsSupportOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium text-content-secondary hover:bg-page hover:text-content-primary transition-colors whitespace-nowrap shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#1F7A5A]" />
            <span>Поддержка</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 flex-1 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: PRODUCTS */}
          {/* ========================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-content-primary">
                    Каталог товаров
                  </h2>
                  <p className="text-xs text-content-secondary">
                    Управление ценами, размерами и наличием товаров
                  </p>
                </div>

                <button
                  onClick={() => setIsAddProductOpen(!isAddProductOpen)}
                  className="flex items-center gap-1.5 bg-[#1F7A5A] hover:bg-[#17634A] text-white text-xs font-medium py-2 px-3.5 rounded-[10px] shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить товар</span>
                </button>
              </div>

              
              {/* Category Management Block */}
              <div className="bg-surface rounded-[12px] border border-border p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#1F7A5A]" />
                    <h3 className="text-xs font-semibold text-content-primary">Категории витрины ({categories.filter(c => c.slug !== 'all').length})</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManagingCategories(!isManagingCategories)}
                    className="text-[11px] font-medium text-[#1F7A5A] hover:underline"
                  >
                    {isManagingCategories ? 'Свернуть' : '+ Добавить категорию'}
                  </button>
                </div>

                {/* Categories Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {categories.map((c) => {
                    const count = c.slug === 'all' ? products.length : products.filter(p => p.category_id === c.id).length;
                    return (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-page border border-border text-xs text-content-primary"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-[10px] text-content-secondary font-mono">({count})</span>
                        {c.slug !== 'all' && categories.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id, c.name)}
                            className="text-content-secondary hover:text-red-600 transition-colors ml-0.5"
                            title="Удалить категорию"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                {/* Add Category Form */}
                {isManagingCategories && (
                  <form onSubmit={handleAddCategory} className="flex gap-2 pt-2 border-t border-border">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="Название новой категории (например: Очки, Ремни...)"
                      className="flex-1 px-3 py-1.5 bg-page border border-border rounded-[8px] text-xs text-content-primary placeholder:text-content-secondary focus:outline-none focus:border-[#1F7A5A]"
                    />
                    <button
                      type="submit"
                      disabled={!newCategoryInput.trim()}
                      className="px-3.5 py-1.5 bg-[#1F7A5A] hover:bg-[#17634A] text-white text-xs font-semibold rounded-[8px] transition-colors disabled:opacity-40"
                    >
                      Создать
                    </button>
                  </form>
                )}
              </div>

              {/* Product Limit Indicator */}
              <div className="flex items-center justify-between p-3 bg-surface rounded-[10px] border border-border text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-content-secondary">
                    Лимит товаров:
                  </span>
                  <span className="font-mono font-semibold text-content-primary">
                    {products.length} / {maxProducts === Infinity ? 'Безлимит' : maxProducts} товаров
                  </span>
                </div>

                {currentPlan !== 'pro' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('tariff')}
                    className="text-[11px] font-medium text-[#1F7A5A] hover:underline flex items-center gap-1"
                  >
                    <span>Увеличить лимит товаров →</span>
                  </button>
                )}
              </div>

              {/* Add Product Drawer */}
              {isAddProductOpen && (
                <form
                  onSubmit={handleCreateProduct}
                  className="p-5 bg-surface rounded-[14px] border border-border shadow-xs space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-xs font-semibold text-content-primary">
                      Новый товар в каталоге
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(false)}
                      className="text-content-secondary hover:text-content-primary text-xs font-medium"
                    >
                      Отмена
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-content-primary mb-1">
                      Название товара *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Например: Худи Оверсайз Black"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-content-primary mb-1">
                        Категория
                      </label>
                      <select
                        value={newCategoryId}
                        onChange={(e) => setNewCategoryId(e.target.value)}
                        className="w-full px-2.5 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-content-primary mb-1">
                        Цена ({settings.currency}) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="320000"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs font-mono text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-content-primary mb-1">
                        Старая цена (для скидки)
                      </label>
                      <input
                        type="text"
                        value={newOldPrice}
                        onChange={(e) => setNewOldPrice(e.target.value)}
                        placeholder="390000 или пусто"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs font-mono text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-content-primary mb-1">
                        Тип вариаций
                      </label>
                      <select
                        value={newVariantType}
                        onChange={(e) => setNewVariantType(e.target.value)}
                        className="w-full px-2.5 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                      >
                        <option value="Размер">Размер (S, M, L / 41, 42)</option>
                        <option value="Объём">Объём (30ml, 50ml, 100ml)</option>
                        <option value="Цвет">Цвет (Черный, Белый)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-content-primary mb-1">
                      Варианты (через запятую)
                    </label>
                    <input
                      type="text"
                      value={newSizes}
                      onChange={(e) => setNewSizes(e.target.value)}
                      placeholder="S, M, L, XL или пусто если без размеров"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-content-primary">
                        Фотография товара
                      </label>
                      <label className="text-[#1F7A5A] hover:underline cursor-pointer flex items-center gap-1 text-xs font-medium">
                        <Upload className="w-3 h-3" />
                        <span>Загрузить фото</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, setNewImageUrl)}
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      {newImageUrl && (
                        <div className="relative w-10 h-10 rounded-[8px] overflow-hidden border border-border shrink-0">
                          <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://... или загрузите файл выше"
                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-[10px] text-xs font-mono text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-content-primary">
                        Описание товара
                      </label>
                      <button
                        type="button"
                        onClick={() => handleGenerateAiDescription('new')}
                        disabled={isGeneratingAi}
                        className="flex items-center gap-1 text-[11px] font-medium text-[#1F7A5A] bg-[#E4F1EB] px-2 py-0.5 rounded-[6px] border border-[#1F7A5A]/20 transition-colors disabled:opacity-50"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>{isGeneratingAi ? 'Генерация...' : 'AI Описание'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Материал, особенности посадки..."
                      className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A] resize-none leading-relaxed"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs text-[#C2410C] font-medium">{formError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1F7A5A] hover:bg-[#17634A] text-white font-medium text-xs rounded-[10px] transition-colors"
                  >
                    Опубликовать товар
                  </button>
                </form>
              )}

              {/* Product Cards List */}
              <div className="space-y-2.5">
                {products.map((prod) => {
                  const img =
                    prod.images?.[0] ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center gap-3 p-3 bg-surface rounded-[14px] border border-border shadow-xs"
                    >
                      <div className="relative w-14 h-14 rounded-[10px] overflow-hidden bg-page shrink-0 border border-border">
                        <Image
                          src={img}
                          alt={prod.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-content-primary truncate">
                          {prod.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-[#1F7A5A]">
                            {formatPrice(prod.price, settings.currency)}
                          </span>
                          {prod.old_price && (
                            <span className="text-[10px] text-content-secondary line-through">
                              {formatPrice(prod.old_price, settings.currency)}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded-[4px] ${
                              prod.in_stock
                                ? 'text-[#1F7A5A] bg-[#E4F1EB]'
                                : 'text-content-secondary bg-page'
                            }`}
                          >
                            {prod.in_stock ? 'В наличии' : 'Распродано'}
                          </span>
                        </div>

                        {prod.sizes && prod.sizes.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-content-secondary truncate">
                            <span>{prod.variant_type || 'Варианты'}:</span>
                            <span className="font-medium text-content-primary">
                              {prod.sizes.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions: ONLY "Изменить" visible + "⋯" dropdown */}
                      <div className="flex items-center gap-1.5 shrink-0 relative">
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          className="px-3 py-1.5 rounded-[10px] bg-surface hover:bg-page text-content-primary border border-border text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#1F7A5A]" />
                          <span>Изменить</span>
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionMenuId(openActionMenuId === prod.id ? null : prod.id)
                            }
                            className="p-1.5 rounded-[10px] bg-surface hover:bg-page text-content-secondary border border-border transition-colors"
                            title="Дополнительные действия"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openActionMenuId === prod.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-[10px] shadow-md py-1 z-30 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  setSelectedStoriesProduct(prod);
                                }}
                                className="w-full text-left px-3 py-1.5 text-content-primary hover:bg-page flex items-center gap-2 font-medium"
                              >
                                <Instagram className="w-3.5 h-3.5 text-content-secondary" />
                                <span>Макет для Stories</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  handleDuplicateProduct(prod);
                                }}
                                className="w-full text-left px-3 py-1.5 text-content-primary hover:bg-page flex items-center gap-2 font-medium"
                              >
                                <Copy className="w-3.5 h-3.5 text-content-secondary" />
                                <span>Дублировать</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  if (confirm(`Удалить товар «${prod.title}»?`)) {
                                    deleteShopProduct(activeSlug, prod.id);
                                  }
                                }}
                                className="w-full text-left px-3 py-1.5 text-[#C2410C] hover:bg-[#FFF5F5] flex items-center gap-2 font-medium border-t border-border"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-[#C2410C]" />
                                <span>Удалить</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Edit Product Modal */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
                  <div className="absolute inset-0" onClick={() => setEditingProduct(null)} />
                  <div className="relative w-full max-w-lg bg-surface border border-border rounded-[14px] shadow-lg p-5 sm:p-6 z-10 max-h-[92vh] overflow-y-auto text-content-primary">
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-content-primary">
                          Настройка карточки товара
                        </h3>
                        <p className="text-[11px] text-content-secondary">
                          Параметры наличия, цены, размера и фотографии
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="w-7 h-7 rounded-[8px] bg-page hover:bg-[#E7E4DC] text-content-secondary flex items-center justify-center transition-colors"
                        aria-label="Закрыть"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateProduct} className="space-y-3.5">
                      {/* In-Stock Toggle inside card settings */}
                      <label className="flex items-center gap-3 p-3 rounded-[10px] bg-page border border-border cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={editInStock}
                          onChange={(e) => setEditInStock(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1F7A5A] accent-[#1F7A5A] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-content-primary block">
                            Товар в наличии
                          </span>
                          <span className="text-[10px] text-content-secondary">
                            {editInStock ? 'Покупатели могут оформить заказ' : 'Товар отображается с бейджем «Распродано»'}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-[4px] ${
                            editInStock
                              ? 'bg-[#E4F1EB] text-[#1F7A5A]'
                              : 'bg-[#E7E4DC] text-content-secondary'
                          }`}
                        >
                          {editInStock ? 'Доступен' : 'Распродано'}
                        </span>
                      </label>

                      <div>
                        <label className="block text-xs font-medium text-content-primary mb-1">
                          Название товара *
                        </label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-content-primary mb-1">
                            Категория
                          </label>
                          <select
                            value={editCategoryId}
                            onChange={(e) => setEditCategoryId(e.target.value)}
                            className="w-full px-2.5 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-content-primary mb-1">
                            Цена ({settings.currency}) *
                          </label>
                          <input
                            type="text"
                            required
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs font-mono text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-content-primary mb-1">
                            Старая цена (для скидки)
                          </label>
                          <input
                            type="text"
                            value={editOldPrice}
                            onChange={(e) => setEditOldPrice(e.target.value)}
                            placeholder="Пусто если нет скидки"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs font-mono text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-content-primary mb-1">
                            Тип вариаций
                          </label>
                          <select
                            value={editVariantType}
                            onChange={(e) => setEditVariantType(e.target.value)}
                            className="w-full px-2.5 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                          >
                            <option value="Размер">Размер (S, M, L / 41, 42)</option>
                            <option value="Объём">Объём (30ml, 50ml, 100ml)</option>
                            <option value="Цвет">Цвет (Черный, Белый)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-content-primary mb-1">
                          Варианты (через запятую)
                        </label>
                        <input
                          type="text"
                          value={editSizes}
                          onChange={(e) => setEditSizes(e.target.value)}
                          placeholder="S, M, L или пусто"
                          className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-content-primary">
                            Фотография товара
                          </label>
                          <label className="text-[#1F7A5A] hover:underline cursor-pointer flex items-center gap-1 text-xs font-medium">
                            <Upload className="w-3 h-3" />
                            <span>Загрузить фото</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, setEditImageUrl)}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          {editImageUrl && (
                            <div className="relative w-10 h-10 rounded-[8px] overflow-hidden border border-border shrink-0">
                              <img src={editImageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <input
                            type="text"
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            placeholder="https://... или загрузите файл выше"
                            className="flex-1 px-3 py-2 bg-surface border border-border rounded-[10px] text-xs font-mono text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-content-primary">
                            Описание товара
                          </label>
                          <button
                            type="button"
                            onClick={() => handleGenerateAiDescription('edit')}
                            disabled={isGeneratingAi}
                            className="flex items-center gap-1 text-[11px] font-medium text-[#1F7A5A] bg-[#E4F1EB] px-2 py-0.5 rounded-[6px] border border-[#1F7A5A]/20 transition-colors disabled:opacity-50"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>{isGeneratingAi ? 'Генерация...' : 'AI Описание'}</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A] resize-none leading-relaxed"
                        />
                      </div>

                      {editFormError && (
                        <p className="text-xs text-[#C2410C] font-medium">{editFormError}</p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-[#1F7A5A] hover:bg-[#17634A] text-white font-medium text-xs rounded-[10px] transition-colors"
                        >
                          Сохранить изменения
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2.5 bg-page hover:bg-[#E7E4DC] text-content-primary font-medium text-xs rounded-[10px] border border-border transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ORDERS */}
          {/* ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Single Line Analytics + Add Product Button */}
              <div className="bg-surface border border-border rounded-[10px] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-content-primary">
                  <span className="text-content-secondary">Заказов:</span>
                  <span className="font-semibold">{orders.length}</span>
                  <span className="text-[#E7E4DC]">•</span>
                  <span className="text-content-secondary">Выручка:</span>
                  <span className="font-semibold text-[#1F7A5A]">{formatPrice(totalRevenue, settings.currency)}</span>
                  <span className="text-[#E7E4DC]">•</span>
                  <span className="text-content-secondary">Конверсия:</span>
                  <span className="font-semibold">{conversionRate}%</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('products');
                    setIsAddProductOpen(true);
                  }}
                  className="bg-[#1F7A5A] hover:bg-[#17634A] text-white px-3 py-1.5 rounded-[10px] font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить товар</span>
                </button>
              </div>

              {/* Top Selling Products (Pro Analytics Widget) */}
              <div className="bg-surface rounded-[14px] border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1F7A5A]" />
                    <h3 className="text-xs font-semibold text-content-primary">
                      Топ товаров по продажам
                    </h3>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-[6px] bg-[#E4F1EB] text-[#1F7A5A]">
                    {isProPlan ? 'PRO ДАШБОРД' : 'ТАРИФ PRO'}
                  </span>
                </div>

                {topProducts.length > 0 ? (
                  <div className="space-y-2">
                    {topProducts.map((p, idx) => (
                      <div
                        key={p.title}
                        className="flex items-center justify-between p-2 rounded-[10px] bg-page border border-border text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className={`w-5 h-5 rounded-[6px] flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                            idx === 0
                              ? 'bg-[#1F7A5A] text-white'
                              : 'bg-[#E7E4DC] text-content-primary'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-medium text-content-primary truncate">
                            {p.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-right font-mono">
                          <span className="text-[11px] text-content-secondary">
                            <b>{p.count}</b> шт.
                          </span>
                          <span className="font-semibold text-[#1F7A5A] text-[11px]">
                            {formatPrice(p.revenue, settings.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs text-content-secondary">
                    Статистика продаж формируется автоматически по мере поступления заказов
                  </div>
                )}
              </div>

              {/* Controls: Periods & Filters & Dual Excel Export Buttons */}
              <div className="bg-surface rounded-[14px] border border-border p-3 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-content-secondary mr-1">Период:</span>
                    <button
                      type="button"
                      onClick={() => setOrdersPeriod('all')}
                      className={`text-xs font-medium px-2.5 py-1 rounded-[8px] transition-colors ${
                        ordersPeriod === 'all'
                          ? 'bg-[#1F7A5A] text-white shadow-xs'
                          : 'bg-surface border border-border text-content-secondary hover:bg-page hover:text-content-primary'
                      }`}
                    >
                      Все время
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrdersPeriod('today')}
                      className={`text-xs font-medium px-2.5 py-1 rounded-[8px] transition-colors ${
                        ordersPeriod === 'today'
                          ? 'bg-[#1F7A5A] text-white shadow-xs'
                          : 'bg-surface border border-border text-content-secondary hover:bg-page hover:text-content-primary'
                      }`}
                    >
                      Сегодня
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrdersPeriod('week')}
                      className={`text-xs font-medium px-2.5 py-1 rounded-[8px] transition-colors ${
                        ordersPeriod === 'week'
                          ? 'bg-[#1F7A5A] text-white shadow-xs'
                          : 'bg-surface border border-border text-content-secondary hover:bg-page hover:text-content-primary'
                      }`}
                    >
                      7 дней
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrdersPeriod('month')}
                      className={`text-xs font-medium px-2.5 py-1 rounded-[8px] transition-colors ${
                        ordersPeriod === 'month'
                          ? 'bg-[#1F7A5A] text-white shadow-xs'
                          : 'bg-surface border border-border text-content-secondary hover:bg-page hover:text-content-primary'
                      }`}
                    >
                      30 дней
                    </button>
                  </div>

                  {/* Dual Export Buttons (Excel .xls and CSV .csv) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportOrdersToExcel('xls')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#1F7A5A] hover:bg-[#17634A] text-white text-xs font-medium shadow-xs transition-colors"
                      title="Скачать отчет в формате Excel (.xls)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel (.xls)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportOrdersToExcel('csv')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-surface hover:bg-page text-content-primary text-xs font-medium shadow-xs transition-colors border border-border"
                      title="Скачать отчет в формате CSV (.csv)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV (.csv)</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-[11px] text-content-secondary font-medium">
                    Найдено: <b className="text-content-primary">{filteredOrders.length}</b> заказов
                  </span>

                  <div className="flex items-center gap-1 bg-page p-0.5 rounded-[8px] text-[11px] font-medium border border-border">
                    <button
                      onClick={() => setOrderStatusFilter('all')}
                      className={`px-2 py-0.5 rounded-[6px] ${
                        orderStatusFilter === 'all'
                          ? 'bg-surface shadow-xs text-content-primary font-semibold'
                          : 'text-content-secondary'
                      }`}
                    >
                      Все
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('new')}
                      className={`px-2 py-0.5 rounded-[6px] ${
                        orderStatusFilter === 'new'
                          ? 'bg-surface shadow-xs text-content-primary font-semibold'
                          : 'text-content-secondary'
                      }`}
                    >
                      Новые
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('completed')}
                      className={`px-2 py-0.5 rounded-[6px] ${
                        orderStatusFilter === 'completed'
                          ? 'bg-surface shadow-xs text-content-primary font-semibold'
                          : 'text-content-secondary'
                      }`}
                    >
                      Выполнен
                    </button>
                  </div>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center bg-surface rounded-[14px] border border-border p-6 shadow-xs">
                  <ShoppingBag className="w-10 h-10 text-content-secondary/40 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-content-primary">
                    Пока нет заказов за выбранный период
                  </h3>
                  <p className="text-xs text-content-secondary mt-1 max-w-xs mx-auto">
                    Заказы с витрины будут автоматически появляться здесь и отправляться в ваш Telegram
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const cleanPhone = order.customer_phone.replace(/[^\d+]/g, '');

                    return (
                      <div
                        key={order.id}
                        className="bg-surface rounded-[14px] border border-border p-4 space-y-3 shadow-xs text-content-primary"
                      >
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-content-primary">
                              #{order.id}
                            </span>
                            <span className="text-[11px] text-content-secondary">
                              {formatDate(order.created_at)}
                            </span>
                          </div>

                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateShopOrderStatus(activeSlug, order.id, e.target.value as any)
                            }
                            className={`text-xs font-medium px-2 py-1 rounded-[8px] border focus:outline-none ${
                              order.status === 'new'
                                ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                                : order.status === 'completed'
                                ? 'bg-[#E4F1EB] text-[#1F7A5A] border-[#1F7A5A]/30'
                                : 'bg-[#FFF5F5] text-[#C2410C] border-[#FCA5A5]'
                            }`}
                          >
                            <option value="new">Новый</option>
                            <option value="completed">Выполнен</option>
                            <option value="cancelled">Отменён</option>
                          </select>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-content-primary">
                              {order.customer_name}
                            </span>
                            <span className="text-content-secondary font-medium inline-flex items-center gap-1">
                              {order.delivery_type === 'delivery' ? (
                                <>
                                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Доставка</span>
                                </>
                              ) : (
                                <>
                                  <Store className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Самовывоз</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="flex items-center gap-1 text-[11px] font-medium bg-[#E4F1EB] text-[#1F7A5A] px-2 py-1 rounded-[6px] border border-[#1F7A5A]/20 hover:brightness-95"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customer_phone}</span>
                            </a>

                            <a
                              href={`https://t.me/${cleanPhone.replace('+', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-medium bg-page text-content-primary px-2 py-1 rounded-[6px] border border-border hover:bg-[#E7E4DC]"
                            >
                              <Send className="w-3 h-3 text-[#1F7A5A]" />
                              <span>Написать в TG</span>
                            </a>

                            {order.address && (
                              <a
                                href={`https://yandex.ru/maps/?text=${encodeURIComponent(order.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] font-medium bg-page text-content-primary px-2 py-1 rounded-[6px] border border-border hover:bg-[#E7E4DC]"
                                title="Открыть точку в Яндекс Картах для заказа курьера"
                              >
                                <MapPin className="w-3 h-3 text-[#1F7A5A] shrink-0" />
                                <span>Открыть в Яндекс Картах</span>
                              </a>
                            )}
                          </div>

                          {order.address && (
                            <p className="text-[11px] text-content-secondary pt-1 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-content-secondary shrink-0" />
                              <span><b>Адрес:</b> {order.address}</span>
                            </p>
                          )}
                          {order.comment && (
                            <p className="text-[11px] text-content-primary bg-page border border-border p-2 rounded-[8px] mt-1 italic flex items-start gap-1.5">
                              <MessageSquare className="w-3 h-3 text-content-secondary shrink-0 mt-0.5" />
                              <span>«{order.comment}»</span>
                            </p>
                          )}
                        </div>

                        {/* Items */}
                        <div className="bg-page rounded-[10px] p-2.5 space-y-1.5 border border-border">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-content-primary truncate pr-2">
                                • {item.title} {item.size && <b>({item.size})</b>}
                              </span>
                              <span className="text-content-secondary font-mono shrink-0">
                                {item.quantity} × {formatPrice(item.price, settings.currency)}
                              </span>
                            </div>
                          ))}

                          <div className="flex items-center justify-between text-xs font-semibold border-t border-border pt-1.5 mt-1.5 text-content-primary">
                            <span>Итого:</span>
                            <span className="text-[#1F7A5A] font-semibold">{formatPrice(order.total_price, settings.currency)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SHARE / QR CODE */}
          {/* ========================================================================= */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-content-primary">
                  Ссылка и QR-код витрины
                </h2>
                <p className="text-xs text-content-secondary">
                  Разместите ссылку в шапке профиля Instagram или распечатайте QR-код для упаковки
                </p>
              </div>

              <div className="bg-surface rounded-[14px] border border-border p-4 sm:p-6 shadow-xs">
                <QRCodeCard
                  shopSlug={activeSlug}
                  storeName={settings.store_name}
                  accentColor={settings.accent_color}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TELEGRAM INTEGRATION (MULTI-TENANT RULE 1) */}
          {/* ========================================================================= */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-content-primary">
                  Привязка Telegram (Куда присылать заказы)
                </h2>
                <p className="text-xs text-content-secondary">
                  У каждого продавца свой Telegram Chat ID — заказы будут приходить лично вам
                </p>
              </div>

              <div className="bg-surface border border-border rounded-[14px] p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-[#E4F1EB] text-[#1F7A5A] flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-content-primary">
                      Как настроить получение заказов за 30 секунд:
                    </h3>
                    <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                      1. Откройте в Telegram официального бота BioMart:{' '}
                      <a
                        href="https://t.me/BioMartAssistant_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1F7A5A] font-semibold underline"
                      >
                        @BioMartAssistant_bot
                      </a>.<br />
                      2. Скопируйте цифры вашего <b>Id</b> (например, <code className="bg-page border border-border text-[#1F7A5A] px-1 rounded-[4px]">123456789</code>).<br />
                      3. Вставьте ваш Chat ID в поле ниже и нажмите «Сохранить привязку».
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveTelegram} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-content-primary mb-1">
                      Ваш Telegram Chat ID для заказов:
                    </label>
                    <input
                      type="text"
                      value={settingsForm.telegram_chat_id || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          telegram_chat_id: e.target.value.trim(),
                        })
                      }
                      placeholder="Например: 987654321 (или ID вашей группы)"
                      className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-[10px] text-xs font-mono text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                    />
                  </div>

                  {tgSavedToast && (
                    <div className="p-2.5 rounded-[10px] bg-[#E4F1EB] text-[#1F7A5A] text-xs font-medium flex items-center gap-1.5 animate-fade-in border border-[#1F7A5A]/20">
                      <Check className="w-4 h-4 text-[#1F7A5A] stroke-[2.5]" />
                      <span>Telegram Chat ID успешно сохранён! Заказы приходят прямо в ваш чат.</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="py-2.5 px-4 bg-[#1F7A5A] hover:bg-[#17634A] text-white font-medium text-xs rounded-[10px] transition-colors"
                    >
                      Сохранить привязку Telegram
                    </button>

                    <a
                      href="https://t.me/BioMartAssistant_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-surface text-content-primary border border-border font-medium text-xs rounded-[10px] hover:bg-page transition-colors flex items-center gap-1.5"
                    >
                      <span>Узнать ID в @BioMartAssistant_bot</span>
                      <ExternalLink className="w-3.5 h-3.5 text-content-secondary" />
                    </a>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: STOREFRONT DESIGN EDITOR (БАГ 10 & РЕДАКТОР ДИЗАЙНА) */}
          {/* ========================================================================= */}
          {(activeTab === 'branding' || activeTab === 'design') && (
            <StorefrontDesignEditor
              settings={settings}
              language={language}
              onSave={(updatedThemeSettings) => {
                updateShopSettings(activeSlug, {
                  theme_settings: updatedThemeSettings,
                  accent_color: updatedThemeSettings.accent_color,
                  theme: updatedThemeSettings.theme,
                  catalog_layout: updatedThemeSettings.catalog_layout,
                  avatar_url: updatedThemeSettings.avatar_url || settings.avatar_url,
                  banner_url: updatedThemeSettings.banner_url || settings.banner_url,
                  radii_preset: updatedThemeSettings.radii_preset,
                  button_text: updatedThemeSettings.button_text,
                  show_old_price: updatedThemeSettings.show_old_price,
                  announcement_active: updatedThemeSettings.announcement_active,
                  announcement_text: updatedThemeSettings.announcement_text,
                  hide_branding: updatedThemeSettings.hide_branding,
                });
                if (supabase) {
                  try {
                    supabase
                      .from('stores')
                      .update({
                        theme_settings: updatedThemeSettings,
                        accent_color: updatedThemeSettings.accent_color,
                        theme: updatedThemeSettings.theme,
                        catalog_layout: updatedThemeSettings.catalog_layout,
                        hide_branding: updatedThemeSettings.hide_branding,
                      })
                      .eq('slug', activeSlug)
                      .then();
                  } catch {}
                }
                setToastMessage(language === 'uz' ? 'Vitrina dizayni sozlamalari saqlandi!' : 'Настройки дизайна витрины сохранены!');
                setTimeout(() => setToastMessage(null), 3000);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 5: TARIFF */}
          {/* ========================================================================= */}
          {activeTab === 'tariff' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-content-primary flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#1F7A5A]" />
                  <span>Тариф вашего магазина</span>
                </h2>
                <p className="text-xs text-content-secondary">
                  Выберите подходящий план для увеличения лимита товаров и доступа к функциям
                </p>
              </div>

              {/* Current Active Plan Status */}
              <div className="p-3 rounded-[10px] bg-[#E4F1EB] border border-[#1F7A5A]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
                  <span className="font-semibold text-content-primary">
                    Текущий тариф: <span className="uppercase text-[#1F7A5A] font-semibold">{settings.plan || 'Start'}</span>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-content-secondary">
                  Товары: {products.length} / {maxProducts === Infinity ? 'Безлимит' : maxProducts}
                </span>
              </div>

              {/* TARIFF CARDS (Start / Plus / Pro) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Start */}
                <div
                  onClick={() => {
                    setSettingsForm({ ...settingsForm, plan: 'start', hide_branding: false });
                    updateShopSettings(activeSlug, { plan: 'start', hide_branding: false });
                    showToast('Тариф «Start» активен');
                  }}
                  className={`p-4 rounded-[14px] cursor-pointer transition-all bg-surface ${
                    (settingsForm.plan || 'start') === 'start'
                      ? 'border-2 border-[#1F7A5A]'
                      : 'border border-border hover:border-[#1F7A5A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-content-primary">Start</span>
                    {(settingsForm.plan || 'start') === 'start' && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-[6px] bg-[#1F7A5A] text-white">
                        Активен
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-content-primary">0 сум</div>
                  <ul className="text-xs text-content-primary mt-3 space-y-1.5 border-t border-border pt-2.5">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>До 15 товаров</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>Заказы в Telegram</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>Базовая витрина</span>
                    </li>
                  </ul>
                </div>

                {/* Plus */}
                <div
                  onClick={() => {
                    setSettingsForm({ ...settingsForm, plan: 'plus' });
                    updateShopSettings(activeSlug, { plan: 'plus' });
                    showToast('Тариф «Plus» активирован');
                  }}
                  className={`p-4 rounded-[14px] cursor-pointer transition-all bg-surface ${
                    settingsForm.plan === 'plus'
                      ? 'border-2 border-[#1F7A5A]'
                      : 'border border-border hover:border-[#1F7A5A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#1F7A5A]">Plus</span>
                    {settingsForm.plan === 'plus' && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-[6px] bg-[#1F7A5A] text-white">
                        Активен
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-content-primary">
                    59 000 сум <span className="text-xs font-normal text-content-secondary">/ мес</span>
                  </div>
                  <ul className="text-xs text-content-primary mt-3 space-y-1.5 border-t border-border pt-2.5">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>До 100 товаров</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>Отключение логотипа BioMart</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>5 вариантов акцентного цвета</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>Генератор для Stories (9:16)</span>
                    </li>
                  </ul>
                </div>

                {/* Pro */}
                <div
                  onClick={() => {
                    setSettingsForm({ ...settingsForm, plan: 'pro' });
                    updateShopSettings(activeSlug, { plan: 'pro' });
                    showToast('Тариф «Pro» активирован');
                  }}
                  className={`p-4 rounded-[14px] cursor-pointer transition-all bg-surface ${
                    settingsForm.plan === 'pro'
                      ? 'border-2 border-[#1F7A5A]'
                      : 'border border-border hover:border-[#1F7A5A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#1F7A5A]">Pro Бизнес</span>
                    {settingsForm.plan === 'pro' && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-[6px] bg-[#1F7A5A] text-white">
                        Активен
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-content-primary">
                    129 000 сум <span className="text-xs font-normal text-content-secondary">/ мес</span>
                  </div>
                  <ul className="text-xs text-content-primary mt-3 space-y-1.5 border-t border-border pt-2.5">
                    <li className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>AI-Ассистент описаний</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>Безлимит товаров</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>Экспорт заказов в Excel / CSV</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1F7A5A] shrink-0" />
                      <span>Промокоды и аналитика</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Help & Billing Support Box */}
              <div className="p-4 rounded-[14px] bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[#E4F1EB] text-[#1F7A5A] flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-content-primary">
                      Возникли сложности с оплатой или подпиской?
                    </h3>
                    <p className="text-[11px] text-content-secondary">
                      Если подписка не работает, списались средства или не обновился лимит товаров — напишите нам.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSupportCategory('billing');
                    setIsSupportOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#1F7A5A] hover:bg-[#17634A] text-white font-medium rounded-[10px] transition-colors whitespace-nowrap shrink-0"
                >
                  Сообщить о проблеме с подпиской
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: AI-ASSISTANT (GROQ AI - PRO FEATURE) */}
          {/* ========================================================================= */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-content-primary flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[#1F7A5A]" />
                    <span>AI-Ассистент</span>
                  </h2>
                  <p className="text-xs text-content-secondary">
                    Генерация описаний товаров, идей для Stories и текстов акций
                  </p>
                </div>
              </div>

              {currentPlan !== 'pro' ? (
                /* Pro Gatekeeper Screen */
                <div className="p-6 bg-surface rounded-[14px] border border-border text-center space-y-4">
                  <div className="w-12 h-12 rounded-[10px] bg-[#E4F1EB] text-[#1F7A5A] flex items-center justify-center mx-auto">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-content-primary">
                      AI-Ассистент доступен на тарифе Pro
                    </h3>
                    <p className="text-xs text-content-secondary mt-1 max-w-md mx-auto leading-relaxed">
                      Перейдите на тариф Pro, чтобы составлять продающие описания товаров, придумывать акции для Stories и получать быстрые советы по продажам.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tariff')}
                    className="px-5 py-2.5 bg-[#1F7A5A] hover:bg-[#17634A] text-white rounded-[10px] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Перейти на тариф Pro (129 000 сум) →
                  </button>
                </div>
              ) : (
                /* Active Pro Chat Screen */
                <div className="bg-surface rounded-[14px] border border-border flex flex-col h-[520px] overflow-hidden shadow-xs">
                  {/* Quick Prompts Bar */}
                  <div className="p-3 border-b border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Составь продающее описание для товара в Instagram Stories с ценой и размерами')}
                      className="px-2.5 py-1 rounded-[8px] bg-page hover:bg-[#E7E4DC] text-[11px] font-medium text-content-primary whitespace-nowrap transition-colors border border-border"
                    >
                      Текст для Stories
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Придумай 3 идеи промокодов и механику акции на выходные для магазина в Ташкенте')}
                      className="px-2.5 py-1 rounded-[8px] bg-page hover:bg-[#E7E4DC] text-[11px] font-medium text-content-primary whitespace-nowrap transition-colors border border-border"
                    >
                      Идеи акций
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Как организовать доставку через Yandex Delivery и BTS по Узбекистану? Дай пошаговую инструкцию')}
                      className="px-2.5 py-1 rounded-[8px] bg-page hover:bg-[#E7E4DC] text-[11px] font-medium text-content-primary whitespace-nowrap transition-colors border border-border"
                    >
                      Совет по доставке
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Напиши вежливый скрипт ответа клиенту в Telegram, который спросил «Сколько стоит?»')}
                      className="px-2.5 py-1 rounded-[8px] bg-page hover:bg-[#E7E4DC] text-[11px] font-medium text-content-primary whitespace-nowrap transition-colors border border-border"
                    >
                      Скрипт ответа в Direct
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-page">
                    {aiMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-[8px] bg-[#E4F1EB] text-[#1F7A5A] flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] p-3 rounded-[10px] text-xs leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-[#1F7A5A] text-white'
                              : 'bg-surface border border-border text-content-primary'
                          }`}
                        >
                          {cleanDisplayAiText(msg.content)}
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex items-center gap-2 text-xs text-content-secondary p-2">
                        <Bot className="w-4 h-4 animate-spin text-[#1F7A5A]" />
                        <span>AI готовит ответ...</span>
                      </div>
                    )}
                  </div>

                  {/* Input Box */}
                  <div className="p-3 border-t border-border flex items-center gap-2 bg-surface">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendAiMessage();
                        }
                      }}
                      placeholder="Задайте вопрос AI-ассистенту..."
                      className="flex-1 px-3.5 py-2 bg-surface border border-border rounded-[10px] text-xs text-content-primary focus:outline-none focus:border-[#1F7A5A]"
                    />
                    <button
                      type="button"
                      disabled={!aiInput.trim() || isAiLoading}
                      onClick={() => handleSendAiMessage()}
                      className="px-3.5 py-2 bg-[#1F7A5A] hover:bg-[#17634A] disabled:opacity-50 text-white rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Отправить</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Stories 9:16 Sticker Modal */}
      <StoriesGeneratorModal
        product={selectedStoriesProduct}
        storeSettings={settings}
        isOpen={Boolean(selectedStoriesProduct)}
        onClose={() => setSelectedStoriesProduct(null)}
      />

      {/* Support & Feedback Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        shopSlug={activeSlug}
        defaultCategory={supportCategory}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-[10px] shadow-lg border border-[#333333] text-xs font-medium flex items-center gap-2 animate-slide-up">
          <Check className="w-4 h-4 text-[#1F7A5A] stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
