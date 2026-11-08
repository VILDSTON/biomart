import { Category, Order, Product, StoreSettings } from '@/types';

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
