import { Category, Order, Product, StoreSettings, StoreNiche, TrustBadgeItem, StoreReview, ShopData } from '@/types';

export const ACCENT_COLOR_PRESETS = [
  {
    name: 'Изумруд / BioMart',
    value: '#1F7A5A',
    label: 'BioMart',
    bgClass: 'bg-[#1F7A5A]',
    description: 'Фирменный зелёный, доверие, органика, премиальный ритейл',
  },
  {
    name: 'Минимал / Onyx',
    value: '#171717',
    label: 'Onyx',
    bgClass: 'bg-neutral-900',
    description: 'Мужская одежда, стритвир, кроссовки, электроника, часы',
  },
  {
    name: 'Berry / Rose',
    value: '#E11D48',
    label: 'Berry',
    bgClass: 'bg-rose-600',
    description: 'Корейская косметика, десерты, бенто-торты, цветы',
  },
  {
    name: 'Emerald / Mint',
    value: '#059669',
    label: 'Mint',
    bgClass: 'bg-emerald-600',
    description: 'Здоровое питание, эко-товары, парфюмерия, аптеки',
  },
  {
    name: 'Electric Indigo',
    value: '#4F46E5',
    label: 'Indigo',
    bgClass: 'bg-indigo-600',
    description: 'Аксессуары для авто, гаджеты, обувь, строгие бренды',
  },
  {
    name: 'Warm Amber',
    value: '#D97706',
    label: 'Amber',
    bgClass: 'bg-amber-600',
    description: 'Кофейни, кондитерские, выпечка, изделия ручной работы',
  },
  {
    name: 'Sky Blue / Cyan',
    value: '#0284C7',
    label: 'Sky',
    bgClass: 'bg-sky-600',
    description: 'Детские товары, оптика, спортивное питание, свежесть',
  },
  {
    name: 'Royal Violet',
    value: '#7C3AED',
    label: 'Violet',
    bgClass: 'bg-violet-600',
    description: 'Селективный парфюм, ювелирные изделия, подарки',
  },
  {
    name: 'Crimson Red',
    value: '#DC2626',
    label: 'Crimson',
    bgClass: 'bg-red-600',
    description: 'Стритфуд, яркие дропы, молодежный мерч',
  },
];

export const THEME_PRESETS = [
  {
    id: 'minimal',
    name: 'Минимал',
    description: 'Светлая, строгая, минималистичные радиусы и аккуратные рамки',
    badge: 'Светлая',
  },
  {
    id: 'warm',
    name: 'Тёплая',
    description: 'Кремовые тона, мягкие скругления, уютная атмосфера',
    badge: 'Кремовая',
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Тёмная, плотная сетка, яркий контраст, уличный стиль',
    badge: 'Тёмная',
  },
  {
    id: 'boutique',
    name: 'Бутик',
    description: 'Светлая, утончённые serif-заголовки, больше воздуха и эстетики',
    badge: 'Премиум',
  },
] as const;

export const FONT_PRESETS = [
  { id: 'neutral', name: 'Нейтральный', family: 'Onest', preview: 'Onest — современный и чистый' },
  { id: 'strict', name: 'Строгий', family: 'Montserrat', preview: 'Montserrat — плотный геометрический' },
  { id: 'boutique', name: 'Акцентный (Serif)', family: 'Playfair Display', preview: 'Playfair — элегантный бутик' },
] as const;

export const RADII_PRESETS = [
  { id: 'sharp', name: 'Острые', value: '2px', description: 'Строгие углы' },
  { id: 'medium', name: 'Средние', value: '10px', description: 'Стандартные (10-14px)' },
  { id: 'round', name: 'Круглые', value: '22px', description: 'Мягкие плавные формы' },
] as const;

export const CARD_STYLE_PRESETS = [
  { id: 'grid2', name: '2 колонки', description: 'Стандартная сетка (Одежда/Обувь)' },
  { id: 'single', name: '1 колонка (крупная)', description: 'Большие фото во всю ширину' },
  { id: 'compact', name: 'Компактный список', description: 'Горизонтальный список с фото' },
] as const;

export const BUTTON_TEXT_PRESETS = [
  { id: 'buy', label: 'Купить' },
  { id: 'order', label: 'Заказать' },
  { id: 'cart', label: 'В корзину' },
] as const;

export const MOCK_STORE_SETTINGS: StoreSettings = {
  id: 'store-1',
  slug: 'tashkent_drip',
  store_name: 'Tashkent Drip',
  description: 'Премиальный streetwear, обувь и селективный парфюм в Ташкенте. Быстрая доставка по всему Узбекистану.',
  avatar_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80',
  banner_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
  instagram_url: 'https://instagram.com/tashkent_drip',
  telegram_username: 'tashkent_drip_order',
  telegram_chat_id: '',
  phone: '+998 90 123 45 67',
  currency: 'сум',
  delivery_info: '',
  accent_color: '#111827',
  theme: 'light',
  catalog_layout: 'grid',
  hide_branding: false,
  is_verified: true,
  plan: 'pro',
  niche: 'clothing',
  theme_settings: {
    preset: 'minimal',
    accent_color: '#111827',
    theme: 'light',
    avatar_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    catalog_layout: 'grid',
    radii_preset: 'medium',
    button_text: 'cart',
    show_old_price: true,
    announcement_active: false,
    announcement_text: '',
    hide_branding: false,
    niche: 'clothing',
  },
  promo_codes: [
    { code: 'VESNA10', discount_percent: 10, active: true },
    { code: 'DRIP20', discount_percent: 20, active: true },
  ],
  custom_links: [
    { id: 'link-td-tg', title: 'Наш Telegram-канал', icon: 'telegram', url: 'https://t.me/tashkent_drip', is_active: true },
    { id: 'link-td-ig', title: 'Instagram с новинками', icon: 'instagram', url: 'https://instagram.com/tashkent_drip', is_active: true },
    { id: 'link-td-yt', title: 'YouTube лукбуки и обзоры', icon: 'youtube', url: 'https://youtube.com/@tashkent_drip', is_active: true },
    { id: 'link-td-ph', title: 'Позвонить менеджеру', icon: 'phone', url: 'tel:+998901234567', is_active: true },
  ],
  team_members: [
    { id: 'mem-1', name: 'Сардор Алимов', phone: '+998 90 123 45 67', role: 'owner', addedAt: '2026-01-15', status: 'active' },
    { id: 'mem-2', name: 'Азиза Каримова', phone: '+998 90 987 65 43', role: 'manager', addedAt: '2026-02-10', status: 'active' },
    { id: 'mem-3', name: 'Шерзод Рустамов', phone: '+998 93 555 44 33', role: 'courier', addedAt: '2026-03-01', status: 'active' },
  ],
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'Все', slug: 'all', sort_order: 0 },
  { id: 'cat-1', name: 'Худи & Свитшоты', slug: 'hoodies', sort_order: 1 },
  { id: 'cat-2', name: 'Обувь & Кроссовки', slug: 'sneakers', sort_order: 2 },
  { id: 'cat-3', name: 'Парфюм & Косметика', slug: 'perfume', sort_order: 3 },
  { id: 'cat-4', name: 'Футболки', slug: 't-shirts', sort_order: 4 },
  { id: 'cat-5', name: 'Аксессуары', slug: 'accessories', sort_order: 5 },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    title: 'Худи Oversize Tashkent Underground',
    description: 'Плотный премиальный хлопок (380г/м²), мягкий начес внутри. Свободная посадка со спущенным плечом. Шелкографический принт с символикой Ташкента.',
    price: 320000,
    old_price: 390000,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Размер',
    sizes: ['S', 'M', 'L', 'XL'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'prod-2',
    category_id: 'cat-2',
    title: 'Кроссовки Retro Runner High Grey',
    description: 'Культовый ретро-силуэт с современной эргономикой. Натуральная мягкая замша и дышащая сетка mesh. Анатомическая амортизирующая подошва EVA.',
    price: 650000,
    old_price: 790000,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Размер',
    sizes: ['40', '41', '42', '43', '44'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'prod-3',
    category_id: 'cat-3',
    title: 'Парфюмерная вода Tashkent Night',
    description: 'Селективный пряно-древесный унисекс аромат. Ноты табачного листа, ванили, кардамона и белого кедра. Французские эфирные масла высшей категории.',
    price: 450000,
    old_price: 520000,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Объём',
    sizes: ['30ml', '50ml', '100ml'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'prod-4',
    category_id: 'cat-4',
    title: 'Футболка Heavyweight Boxy Fit (Black)',
    description: '100% узбекский длинноволокнистый хлопок плотностью 240г/м². Свободный крой boxy fit, усиленный воротник с добавлением лайкры.',
    price: 180000,
    old_price: null,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Размер',
    sizes: ['S', 'M', 'L', 'XL'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'prod-5',
    category_id: 'cat-5',
    title: 'Кепка Базовая Vintage Washed',
    description: 'Винтажный вываренный хлопок с эффектом благородной потертости. Металлическая пряжка сзади. Универсальный размер One Size (56-60 см).',
    price: 95000,
    old_price: 130000,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: '',
    sizes: [],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'prod-6',
    category_id: 'cat-1',
    title: 'Зип-худи Оверсайз Acid Wash Grey',
    description: 'Металлическая двухсторонняя молния YKK. Вываренный оттенок acid wash. Двухслойный капюшон и плотная резинка на манжетах. Лимитированный тираж.',
    price: 380000,
    old_price: null,
    images: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Размер',
    sizes: ['M', 'L'],
    in_stock: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 1041,
    shop_slug: 'tashkent_drip',
    customer_name: 'Сардор Алимов',
    customer_phone: '+998901234567',
    delivery_type: 'delivery',
    address: 'Ташкент, Чиланзар 9, дом 12, кв 45',
    comment: 'Позвоните за 15 минут до приезда',
    items: [
      {
        product_id: 'prod-1',
        title: 'Худи Oversize Tashkent Underground',
        size: 'L',
        price: 320000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      },
      {
        product_id: 'prod-5',
        title: 'Кепка Базовая Vintage Washed',
        size: null,
        price: 95000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      },
    ],
    total_price: 415000,
    status: 'new',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 1040,
    shop_slug: 'tashkent_drip',
    customer_name: 'Мадина Каримова',
    customer_phone: '+998939876543',
    delivery_type: 'pickup',
    address: '',
    comment: 'Заберу сегодня около 19:00',
    items: [
      {
        product_id: 'prod-2',
        title: 'Кроссовки Retro Runner High Grey',
        size: '41',
        price: 650000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      },
    ],
    total_price: 650000,
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
];

export function getStarterProductsForShop(): Product[] {
  return [
    {
      id: `starter-${Date.now()}-1`,
      category_id: 'cat-all',
      title: 'Худи Оверсайз Premium (Пример товара)',
      description: 'Мягкий премиальный хлопок с начесом. Это пример готового товара. Вы можете изменить название, фото, размеры и цену в личном кабинете.',
      price: 290000,
      old_price: 350000,
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      ],
      variant_type: 'Размер',
      sizes: ['S', 'M', 'L', 'XL'],
      in_stock: true,
      created_at: new Date().toISOString(),
    },
    {
      id: `starter-${Date.now()}-2`,
      category_id: 'cat-all',
      title: 'Кепка Базовая Vintage (Пример без размера)',
      description: '100% винтажный хлопок. Пример товара без вариаций размера — клиент может добавить его в корзину в 1 клик.',
      price: 95000,
      old_price: null,
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      ],
      variant_type: '',
      sizes: [],
      in_stock: true,
      created_at: new Date().toISOString(),
    },
  ];
}

export interface NichePresetInfo {
  id: StoreNiche;
  titleRu: string;
  titleUz: string;
  iconName: string;
  badgesRu: TrustBadgeItem[];
  badgesUz: TrustBadgeItem[];
}

export const STORE_NICHE_PRESETS: NichePresetInfo[] = [
  {
    id: 'clothing',
    titleRu: 'Одежда и обувь',
    titleUz: 'Kiyim va poyabzal',
    iconName: 'Shirt',
    badgesRu: [
      { id: 'b1', icon: 'zap', title: 'Быстрая отправка', subtitle: 'По Ташкенту 1-2 часа' },
      { id: 'b2', icon: 'package', title: 'Примерка перед оплатой', subtitle: 'Курьер подождет 15 минут' },
      { id: 'b3', icon: 'message', title: 'Прямая связь', subtitle: 'Ответ в Telegram за 5 минут' },
      { id: 'b4', icon: 'shield', title: 'Обмен размера', subtitle: 'Бесплатный обмен, если не подошло' },
    ],
    badgesUz: [
      { id: 'b1', icon: 'zap', title: 'Tezkor yetkazish', subtitle: 'Toshkent bo‘yicha 1-2 soat' },
      { id: 'b2', icon: 'package', title: 'Kiyib ko‘rish imkoni', subtitle: 'To‘lovdan oldin kiyib ko‘ring' },
      { id: 'b3', icon: 'message', title: 'To‘g‘ridan-to‘g‘ri aloqa', subtitle: 'Telegramda 5 daqiqada javob' },
      { id: 'b4', icon: 'shield', title: 'O‘lchamni almashtirish', subtitle: 'Mos kelmasa, bepul almashtiramiz' },
    ],
  },
  {
    id: 'electronics',
    titleRu: 'Электроника и гаджеты',
    titleUz: 'Elektronika va gadjetlar',
    iconName: 'Smartphone',
    badgesRu: [
      { id: 'b1', icon: 'zap', title: 'Экспресс-доставка', subtitle: 'В день заказа по Ташкенту' },
      { id: 'b2', icon: 'shield', title: '100% Оригинал', subtitle: 'Новая запечатанная техника' },
      { id: 'b3', icon: 'package', title: 'Проверка при курьере', subtitle: 'Вскрытие и проверка до оплаты' },
      { id: 'b4', icon: 'check', title: 'Гарантия качества', subtitle: 'Гарантия и чек на товар' },
    ],
    badgesUz: [
      { id: 'b1', icon: 'zap', title: 'Ekspress yetkazish', subtitle: 'Toshkent bo‘ylab bir kunda' },
      { id: 'b2', icon: 'shield', title: '100% Asl mahsulot', subtitle: 'Yangi ochilmagan texnika' },
      { id: 'b3', icon: 'package', title: 'Kuryer oldida tekshirish', subtitle: 'To‘lovdan avval tekshirib oling' },
      { id: 'b4', icon: 'check', title: 'Sifat kafolati', subtitle: 'Rasmiy kafolat va chek' },
    ],
  },
  {
    id: 'beauty',
    titleRu: 'Парфюм и косметика',
    titleUz: 'Parfyum va kosmetika',
    iconName: 'Sparkles',
    badgesRu: [
      { id: 'b1', icon: 'shield', title: 'Селективный оригинал', subtitle: 'Только подлинная продукция' },
      { id: 'b2', icon: 'package', title: 'Подарок к заказу', subtitle: 'Пробник аромата в посылке' },
      { id: 'b3', icon: 'message', title: 'Консультация в TG', subtitle: 'Поможем подобрать стойкий аромат' },
      { id: 'b4', icon: 'zap', title: 'Бережная упаковка', subtitle: 'Надёжная защита флаконов' },
    ],
    badgesUz: [
      { id: 'b1', icon: 'shield', title: '100% Asl parfyum', subtitle: 'Faqat original mahsulotlar' },
      { id: 'b2', icon: 'package', title: 'Xaridga sovg‘a', subtitle: 'Har bir buyurtmaga probnik' },
      { id: 'b3', icon: 'message', title: 'Telegramda maslahat', subtitle: 'Did va hid tanlashda yordam' },
      { id: 'b4', icon: 'zap', title: 'Ehtiyotkor qadoqlash', subtitle: 'Xavfsiz va chiroyli yetkazamiz' },
    ],
  },
  {
    id: 'food',
    titleRu: 'Еда и выпечка',
    titleUz: 'Taomlar va shirinliklar',
    iconName: 'Utensils',
    badgesRu: [
      { id: 'b1', icon: 'clock', title: 'Доставка от 40 минут', subtitle: 'С пылу с жару прямо к столу' },
      { id: 'b2', icon: 'heart', title: 'Свежие ингредиенты', subtitle: 'Готовим только под заказ' },
      { id: 'b3', icon: 'zap', title: 'Заказ в 1 клик', subtitle: 'Без лишней регистрации' },
      { id: 'b4', icon: 'shield', title: 'Контроль свежести', subtitle: 'Термосумки для горячих блюд' },
    ],
    badgesUz: [
      { id: 'b1', icon: 'clock', title: '40 daqiqadan yetkazish', subtitle: 'Issiq va mazali taomlar' },
      { id: 'b2', icon: 'heart', title: 'Toza masalliqlar', subtitle: 'Faqat buyurtma bo‘yicha pishiriladi' },
      { id: 'b3', icon: 'zap', title: '1 bosqichda xarid', subtitle: 'Ortiqcha ro‘yxatdan o‘tishsiz' },
      { id: 'b4', icon: 'shield', title: 'Termo-yetkazish', subtitle: 'Harorat saqlangan holda keladi' },
    ],
  },
  {
    id: 'flowers',
    titleRu: 'Цветы и подарки',
    titleUz: 'Gullar va sovg‘alar',
    iconName: 'Gift',
    badgesRu: [
      { id: 'b1', icon: 'clock', title: 'Точно ко времени', subtitle: 'Доставим минута в минуту' },
      { id: 'b2', icon: 'package', title: 'Фото до отправки', subtitle: 'Пришлем фото букета в Telegram' },
      { id: 'b3', icon: 'heart', title: 'Открытка в подарок', subtitle: 'Напишем любые ваши пожелания' },
      { id: 'b4', icon: 'shield', title: 'Свежие бутоны', subtitle: 'Гарантия свежести цветка' },
    ],
    badgesUz: [
      { id: 'b1', icon: 'clock', title: 'Aniq vaqtida', subtitle: 'Belgilangan vaqtda yetkazamiz' },
      { id: 'b2', icon: 'package', title: 'Yuborishdan avval rasm', subtitle: 'Telegramda guldastani ko‘rsatamiz' },
      { id: 'b3', icon: 'heart', title: 'Maktub sovg‘a', subtitle: 'Tilaklaringizni yozib qo‘yamiz' },
      { id: 'b4', icon: 'shield', title: 'Tazelik kafolati', subtitle: 'Faqat yangi uzilgan gullar' },
    ],
  },
  {
    id: 'universal',
    titleRu: 'Универсальный магазин',
    titleUz: 'Universal do‘kon',
    iconName: 'Store',
    badgesRu: [
      { id: 'b1', icon: 'zap', title: 'Быстрая отправка', subtitle: 'По Ташкенту и регионам' },
      { id: 'b2', icon: 'package', title: 'Осмотр при получении', subtitle: 'Проверьте товар перед оплатой' },
      { id: 'b3', icon: 'message', title: 'Прямая связь', subtitle: 'Ответ в Telegram за 5 минут' },
      { id: 'b4', icon: 'shield', title: '100% гарантия', subtitle: 'Реальные фото без обмана' },
    ],
    badgesUz: [
      { id: 'b1', icon: 'zap', title: 'Tezkor jo‘natish', subtitle: 'Toshkent va viloyatlarga' },
      { id: 'b2', icon: 'package', title: 'Qabulda tekshirish', subtitle: 'To‘lovdan oldin ko‘rib oling' },
      { id: 'b3', icon: 'message', title: 'To‘g‘ridan-to‘g‘ri aloqa', subtitle: 'Telegramda 5 daqiqada javob' },
      { id: 'b4', icon: 'shield', title: '100% ishonchli', subtitle: 'Haqiqiy suratlar va kafolat' },
    ],
  },
];

export const DEFAULT_STORE_REVIEWS: StoreReview[] = [
  {
    id: 'rev-1',
    author_name: 'Сардор Алимов',
    rating: 5,
    date: 'Вчера',
    text: 'Заказывал с доставкой по Ташкенту через Yandex, привезли буквально за 1.5 часа! Качество отличное, размер подошел идеально. Спасибо продавцу за быстрый ответ в телеге!',
    is_verified: true,
  },
  {
    id: 'rev-2',
    author_name: 'Мадина К.',
    rating: 5,
    date: '3 дня назад',
    text: 'Очень удобная витрина, оформила заказ в 1 клик без всяких паролей. Курьер подождал, пока я открыла и посмотрела вещь. Рекомендую этот магазин!',
    is_verified: true,
  },
  {
    id: 'rev-3',
    author_name: 'Jasur Bek',
    rating: 5,
    date: '5 дней назад',
    text: 'Ajoyib xizmat! Samarqandga BTS orqali ertasi kuni yetib keldi. Mahsulot rasmdegidek, qadoqlanishi juda chiroyli. Rahmat!',
    is_verified: true,
  },
];

// =====================================================================
// DEMO PRESETS: VOLT GADGETS (Electronics)
// =====================================================================
export const VOLT_GADGETS_SETTINGS: StoreSettings = {
  id: 'store-volt-gadgets',
  slug: 'volt_gadgets',
  store_name: 'Volt Gadgets',
  description: 'Гаджеты, наушники и зарядные станции с гарантией и проверкой при курьере в Ташкенте.',
  avatar_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
  banner_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80',
  instagram_url: 'https://instagram.com/volt_gadgets',
  telegram_username: 'volt_gadgets',
  phone: '+998 90 765 43 21',
  currency: 'сум',
  delivery_info: '',
  accent_color: '#4F46E5',
  theme: 'light',
  catalog_layout: 'grid',
  hide_branding: false,
  is_verified: true,
  plan: 'pro',
  niche: 'electronics',
  theme_settings: {
    preset: 'minimal',
    accent_color: '#4F46E5',
    theme: 'light',
    avatar_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80',
    catalog_layout: 'grid',
    radii_preset: 'medium',
    button_text: 'cart',
    show_old_price: true,
    announcement_active: true,
    announcement_text: '⚡ Экспресс-доставка по Ташкенту за 2 часа • Проверка перед оплатой',
    hide_branding: false,
    niche: 'electronics',
  },
  promo_codes: [
    { code: 'VOLT10', discount_percent: 10, active: true },
  ],
  reviews: [
    {
      id: 'rev-vg-1',
      author_name: 'Джасур Умаров',
      rating: 5,
      date: 'Вчера',
      text: 'Заказывал наушники с курьерской доставкой по Ташкенту. Привезли за 40 минут! Проверил звук и микрофон на месте до оплаты. Звучание шикарное, бас чистый.',
      is_verified: true,
    },
    {
      id: 'rev-vg-2',
      author_name: 'Тимур К.',
      rating: 5,
      date: '3 дня назад',
      text: 'Отличный магазин! Чек пришел сразу в Telegram, гарантийный талон в комплекте. Повербанк заряжает моментально.',
      is_verified: true,
    },
    {
      id: 'rev-vg-3',
      author_name: 'Azizbek',
      rating: 5,
      date: '5 дней назад',
      text: 'Juda tez yetkazib berishdi! Mahsulot original va kafolati bor. Yigitlarga gap yo‘q!',
      is_verified: true,
    },
  ],
  custom_links: [
    { id: 'link-vg-tg', title: 'Telegram канал со скидками', icon: 'telegram', url: 'https://t.me/volt_gadgets', is_active: true },
    { id: 'link-vg-yt', title: 'YouTube распаковки гаджетов', icon: 'youtube', url: 'https://youtube.com/@volt_gadgets', is_active: true },
    { id: 'link-vg-ph', title: 'Сервисный отдел и гарантия', icon: 'phone', url: 'tel:+998907654321', is_active: true },
  ],
};

export const VOLT_GADGETS_CATEGORIES: Category[] = [
  { id: 'cat-vg-all', name: 'Все', slug: 'all', sort_order: 0 },
  { id: 'cat-vg-audio', name: 'Наушники', slug: 'headphones', sort_order: 1 },
  { id: 'cat-vg-power', name: 'Повербанки', slug: 'powerbanks', sort_order: 2 },
  { id: 'cat-vg-watches', name: 'Смарт-часы', slug: 'smartwatches', sort_order: 3 },
  { id: 'cat-vg-acc', name: 'Аксессуары', slug: 'accessories', sort_order: 4 },
];

export const VOLT_GADGETS_PRODUCTS: Product[] = [
  {
    id: 'prod-vg-1',
    category_id: 'cat-vg-audio',
    title: 'Беспроводные наушники Volt Pods Max ANC',
    description: 'Активное шумоподавление до 40 дБ, режим прозрачности и пространственное аудио. До 36 часов работы с кейсом.',
    price: 420000,
    old_price: 490000,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Цвет',
    sizes: ['Space Gray', 'Silver', 'Midnight'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
  },
  {
    id: 'prod-vg-2',
    category_id: 'cat-vg-power',
    title: 'Повербанк MagSafe Magnetic 10 000 mAh',
    description: 'Магнитная беспроводная зарядка 15W + быстрая зарядка PD 20W через Type-C. Компактный алюминиевый корпус.',
    price: 260000,
    old_price: 310000,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Цвет',
    sizes: ['Титановый', 'Черный'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'prod-vg-3',
    category_id: 'cat-vg-power',
    title: 'Сетевое зарядное GaN 65W Dual Type-C + USB-A',
    description: 'Технология GaN Pro: в 2 раза меньше стандартных зарядок. Подходит для ноутбуков, планшетов и телефонов.',
    price: 190000,
    old_price: 230000,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: '',
    sizes: [],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 25).toISOString(),
  },
  {
    id: 'prod-vg-4',
    category_id: 'cat-vg-watches',
    title: 'Смарт-часы Volt Fit Pro AMOLED',
    description: 'Яркий Always-On дисплей, измерение пульса, SpO2 и сна. Водонепроницаемость IP68, более 100 спорт-режимов.',
    price: 540000,
    old_price: 650000,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Ремешок',
    sizes: ['Black Silicon', 'Orange Trail'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'prod-vg-5',
    category_id: 'cat-vg-acc',
    title: 'Кабель силиконовый Type-C to Type-C 100W 1.5m',
    description: 'Мягкий нескользящий силикон с защитой от перегибов. Поддержка быстрой зарядки до 100W Power Delivery.',
    price: 75000,
    old_price: null,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: '',
    sizes: [],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
  {
    id: 'prod-vg-6',
    category_id: 'cat-vg-acc',
    title: 'Автомобильный держатель MagSafe 15W',
    description: 'Мощные неодимовые магниты, надежная фиксация в дефлекторе воздуховода, шарнир 360 градусов.',
    price: 180000,
    old_price: 220000,
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: '',
    sizes: [],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
];

// =====================================================================
// DEMO PRESETS: AURA PERFUME (Beauty & Fragrance)
// =====================================================================
export const AURA_PERFUME_SETTINGS: StoreSettings = {
  id: 'store-aura-perfume',
  slug: 'aura_perfume',
  store_name: 'Aura Perfume',
  description: 'Селективная парфюмерия и распивы в Ташкенте. Только оригиналы, фирменный пробник в подарок к каждому заказу.',
  avatar_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
  banner_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80',
  instagram_url: 'https://instagram.com/aura_perfume',
  telegram_username: 'aura_perfume',
  phone: '+998 90 999 88 77',
  currency: 'сум',
  delivery_info: '',
  accent_color: '#7C3AED',
  theme: 'light',
  catalog_layout: 'grid',
  hide_branding: false,
  is_verified: true,
  plan: 'pro',
  niche: 'beauty',
  theme_settings: {
    preset: 'boutique',
    accent_color: '#7C3AED',
    theme: 'light',
    avatar_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    banner_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80',
    catalog_layout: 'grid',
    radii_preset: 'round',
    button_text: 'order',
    show_old_price: true,
    announcement_active: true,
    announcement_text: '✨ Пробник селективного аромата в подарок к каждому заказу!',
    hide_branding: false,
    niche: 'beauty',
  },
  promo_codes: [
    { code: 'AURA15', discount_percent: 15, active: true },
  ],
  reviews: [
    {
      id: 'rev-ap-1',
      author_name: 'Диёра Саидова',
      rating: 5,
      date: 'Вчера',
      text: 'Аромат просто потрясающий, стойкость невероятная — держится весь день! Приложили фирменный пробник в подарок. 100% оригинал, очень довольна!',
      is_verified: true,
    },
    {
      id: 'rev-ap-2',
      author_name: 'Мадина К.',
      rating: 5,
      date: '2 дня назад',
      text: 'Заказывала распив Baccarat. Упаковано в красивую бархатную коробочку, шлейф сумасшедший. Теперь за парфюмом только к вам!',
      is_verified: true,
    },
    {
      id: 'rev-ap-3',
      author_name: 'Shahzoda',
      rating: 5,
      date: '4 дня назад',
      text: 'Ajoyib atir! Hidi juda yoqimli va uzoq vaqt ketmaydi. Sovg‘a uchun berilgan probnik ham zo‘r chiqdi. Rahmat!',
      is_verified: true,
    },
  ],
  custom_links: [
    { id: 'link-ap-tg', title: 'Telegram парфюмерный гид', icon: 'telegram', url: 'https://t.me/aura_perfume', is_active: true },
    { id: 'link-ap-ig', title: 'Instagram новинки ароматов', icon: 'instagram', url: 'https://instagram.com/aura_perfume', is_active: true },
    { id: 'link-ap-ph', title: 'Консультация парфюмера', icon: 'phone', url: 'tel:+998909998877', is_active: true },
  ],
};

export const AURA_PERFUME_CATEGORIES: Category[] = [
  { id: 'cat-ap-all', name: 'Все', slug: 'all', sort_order: 0 },
  { id: 'cat-ap-select', name: 'Селектив', slug: 'selective', sort_order: 1 },
  { id: 'cat-ap-decants', name: 'Распивы', slug: 'decants', sort_order: 2 },
  { id: 'cat-ap-unisex', name: 'Унисекс', slug: 'unisex', sort_order: 3 },
  { id: 'cat-ap-home', name: 'Для дома', slug: 'home', sort_order: 4 },
];

export const AURA_PERFUME_PRODUCTS: Product[] = [
  {
    id: 'prod-ap-1',
    category_id: 'cat-ap-select',
    title: 'Парфюмерная вода Tashkent Night',
    description: 'Селективный пряно-древесный унисекс аромат. Ноты табачного листа, ванили, кардамона и белого кедра.',
    price: 450000,
    old_price: 520000,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Объём',
    sizes: ['30ml', '50ml', '100ml'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 35).toISOString(),
  },
  {
    id: 'prod-ap-2',
    category_id: 'cat-ap-decants',
    title: 'Распив Baccarat Rouge 540 Extrait',
    description: 'Легендарный шлейфовый аромат в фирменном стеклянном атомайзере со спреем. Шафран, горький миндаль и серая амбра.',
    price: 210000,
    old_price: 250000,
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Объём',
    sizes: ['5ml', '10ml', '15ml'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'prod-ap-3',
    category_id: 'cat-ap-select',
    title: 'Парфюмерная вода Tobacco & Vanille Imperial',
    description: 'Богатый восточный аромат теплого табака, бобов тонка, какао и сладкой мадагаскарской ванили.',
    price: 590000,
    old_price: 690000,
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Объём',
    sizes: ['50ml', '100ml'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    id: 'prod-ap-4',
    category_id: 'cat-ap-decants',
    title: 'Распив Fleur Narcotique Eau de Parfum',
    description: 'Цветочно-фруктовый шедевр. Бергамот, сочный персик, жасмин и пион с гипнотическим древесным шлейфом.',
    price: 195000,
    old_price: 230000,
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: 'Объём',
    sizes: ['5ml', '10ml'],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'prod-ap-5',
    category_id: 'cat-ap-home',
    title: 'Аромадиффузор Black Amber & Plum',
    description: 'Премиальный парфюм для дома с ротанговыми палочками (100ml). Стойкость аромата до 3 месяцев.',
    price: 145000,
    old_price: null,
    images: [
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: '',
    sizes: [],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'prod-ap-6',
    category_id: 'cat-ap-unisex',
    title: 'Набор пробников Discovery Box (5 x 3ml)',
    description: '5 самых популярных нишевых ароматов в подарочной коробке: идеальный вариант для знакомства с коллекцией.',
    price: 180000,
    old_price: 220000,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    ],
    variant_type: '',
    sizes: [],
    in_stock: true,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

// =====================================================================
// REGISTRY OF ALL OFFICIAL DEMO SHOPS
// =====================================================================
export const DEMO_PRESET_SHOPS: Record<string, ShopData> = {
  tashkent_drip: {
    settings: MOCK_STORE_SETTINGS,
    categories: MOCK_CATEGORIES,
    products: MOCK_PRODUCTS,
    orders: MOCK_ORDERS,
  },
  volt_gadgets: {
    settings: VOLT_GADGETS_SETTINGS,
    categories: VOLT_GADGETS_CATEGORIES,
    products: VOLT_GADGETS_PRODUCTS,
    orders: [],
  },
  aura_perfume: {
    settings: AURA_PERFUME_SETTINGS,
    categories: AURA_PERFUME_CATEGORIES,
    products: AURA_PERFUME_PRODUCTS,
    orders: [],
  },
};
