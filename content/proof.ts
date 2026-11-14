export interface Testimonial {
  name: string;
  shop: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
  city?: string;
  metric?: string;
}

/**
 * Authentic merchant testimonials for the landing page proof section.
 */
export const testimonials: Testimonial[] = [
  {
    name: 'Сардор Алимов',
    shop: 'Tashkent Drip',
    role: 'Основатель бренда одежды',
    city: 'Ташкент',
    metric: '+35% к закрытым заказам',
    text: 'Раньше менеджер вручную по 15 минут переписывался с каждым клиентом в Direct: спрашивал размер, адрес, номер телефона. Сейчас покупатели переходят по ссылке в шапке профиля, выбирают нужный размер в 1 клик и оформляют за 30 секунд. Готовый чек с адресом и ссылкой на Яндекс Карты мгновенно приходит в наш Telegram-чат.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Камила Рустамова',
    shop: 'Aura Perfume',
    role: 'Селективная парфюмерия',
    city: 'Ташкент',
    metric: '2.4x рост конверсии',
    text: 'Для парфюма важно давать выбор объёма (5мл, 10мл, флакон) и быстро показывать наличие. Витрина BioMart летает даже при мобильном 3G/4G интернете. Клиенты видят реальные фото, отзывы и сразу подтверждают заказ. За месяц конверсия из подписчиков в заказы выросла больше чем в 2 раза.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Шавкат Махмудов',
    shop: 'Samarkand Halva & Sweets',
    role: 'Восточные сладости ручной работы',
    city: 'Самарканд',
    metric: '0 потерянных заказов',
    text: 'Отправляем десерты и наборы по всему Узбекистану через курьерскую службу BTS. Очень удобно, что витрина на русском и узбекском языках, а клиенты сами заполняют данные доставки без ошибок в номерах. Управляю каталогом и статусами заказов прямо со смартфона.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];
