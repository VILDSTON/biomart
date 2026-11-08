import { Category, Order, Product, StoreSettings, StoreNiche, TrustBadgeItem, StoreReview } from '@/types';

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
  store_name: 'TASHKENT DRIP',
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
  },
  promo_codes: [
    { code: 'VESNA10', discount_percent: 10, active: true },
    { code: 'DRIP20', discount_percent: 20, active: true },
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
