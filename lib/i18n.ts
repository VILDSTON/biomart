export type StoreLanguage = 'ru' | 'uz';

export interface Translations {
  addToCart: string;
  added: string;
  buyOneClick: string;
  oneClick: string;
  checkout: string;
  cart: string;
  cartAndCheckout: string;
  emptyCart: string;
  emptyCartDesc: string;
  inStock: string;
  outOfStock: string;
  searchPlaceholder: string;
  all: string;
  noProducts: string;
  clearSearch: string;
  selectVariant: (label: string) => string;
  selected: string;
  quantity: string;
  description: string;
  askTelegram: string;
  name: string;
  namePlaceholder: string;
  phone: string;
  deliveryMethod: string;
  deliveryCourier: string;
  pickup: string;
  deliveryAddress: string;
  addressPlaceholder: string;
  comment: string;
  commentPlaceholder: string;
  promoCode: string;
  apply: string;
  discount: string;
  totalToPay: string;
  submitOrder: string;
  submitting: string;
  phoneError: string;
  orderSuccessTitle: string;
  orderSuccessDesc: string;
  backToCatalog: string;
  contactSellerTelegram: string;
  recipient: string;
  method: string;
  orderNum: (num: string | number) => string;
  wantStoreBadge: string;
  createIn2Min: string;
}

export const translations: Record<StoreLanguage, Translations> = {
  ru: {
    addToCart: 'В корзину',
    added: 'Добавлено',
    buyOneClick: 'Купить',
    oneClick: 'Купить',
    checkout: 'Оформить заказ',
    cart: 'Корзина',
    cartAndCheckout: 'Корзина и оформление',
    emptyCart: 'Ваша корзина пуста',
    emptyCartDesc: 'Выберите понравившиеся вещи в каталоге и добавьте их в корзину',
    inStock: 'В наличии',
    outOfStock: 'Нет в наличии',
    searchPlaceholder: 'Поиск товаров...',
    all: 'Все',
    noProducts: 'Товары не найдены',
    clearSearch: 'Очистить поиск',
    selectVariant: (label: string) => `Выберите ${label.toLowerCase()}`,
    selected: 'Выбран',
    quantity: 'Количество',
    description: 'Описание',
    askTelegram: 'Telegram',
    name: 'Ваше имя',
    namePlaceholder: 'Например, Сардор',
    phone: 'Номер телефона',
    phoneError: 'Пожалуйста, введите корректный номер телефона',
    deliveryMethod: 'Способ получения',
    deliveryCourier: 'Доставка курьером',
    pickup: 'Самовывоз',
    deliveryAddress: 'Адрес доставки',
    addressPlaceholder: 'Город, район, улица, дом...',
    comment: 'Комментарий к заказу (необязательно)',
    commentPlaceholder: 'Например: Позвоните за 30 минут',
    promoCode: 'Промокод',
    apply: 'Применить',
    discount: 'Скидка',
    totalToPay: 'Итого к оплате',
    submitOrder: 'Отправить заказ',
    submitting: 'Отправка заказа...',
    orderSuccessTitle: 'Заказ оформлен',
    orderSuccessDesc: 'Продавец получил уведомление о заказе в Telegram и свяжется с вами для подтверждения.',
    backToCatalog: 'Вернуться к покупкам',
    contactSellerTelegram: 'Написать продавцу в Telegram',
    recipient: 'Получатель',
    method: 'Способ',
    orderNum: (num) => `Заказ #${num}`,
    wantStoreBadge: 'Витрина для Instagram и Telegram',
    createIn2Min: 'Создать на платформе BioMart →',
  },
  uz: {
    addToCart: 'Savatga qo‘shish',
    added: 'Qo‘shildi',
    buyOneClick: 'Xarid qilish',
    oneClick: 'Xarid',
    checkout: 'Buyurtma berish',
    cart: 'Savat',
    cartAndCheckout: 'Savat va buyurtma',
    emptyCart: 'Savatingiz bo‘sh',
    emptyCartDesc: 'Katalogdan yoqqan mahsulotlarni tanlang va savatga qo‘shing',
    inStock: 'Sotuvda mavjud',
    outOfStock: 'Sotuvda yo‘q',
    searchPlaceholder: 'Mahsulotlarni qidirish...',
    all: 'Barchasi',
    noProducts: 'Mahsulotlar topilmadi',
    clearSearch: 'Qidiruvni tozalash',
    selectVariant: (label: string) => {
      const lower = (label || '').toLowerCase();
      if (lower.includes('размер')) return 'O‘lchamni tanlang';
      if (lower.includes('объем') || lower.includes('объём')) return 'Hajmni tanlang';
      if (lower.includes('цвет')) return 'Rangni tanlang';
      return `${label}ni tanlang`;
    },
    selected: 'Tanlangan',
    quantity: 'Miqdori',
    description: 'Tavsif',
    askTelegram: 'Telegram',
    name: 'Ismingiz',
    namePlaceholder: 'Masalan, Sardor',
    phone: 'Telefon raqam',
    phoneError: 'Iltimos, to‘g‘ri telefon raqamingizni kiriting',
    deliveryMethod: 'Qabul qilish usuli',
    deliveryCourier: 'Kuryer orqali yetkazish',
    pickup: 'Olib ketish',
    deliveryAddress: 'Yetkazib berish manzili',
    addressPlaceholder: 'Shahar, tuman, ko‘cha, uy...',
    comment: 'Buyurtmaga izoh (ixtiyoriy)',
    commentPlaceholder: 'Masalan: 30 daqiqa oldin qo‘ng‘iroq qiling',
    promoCode: 'Promokod',
    apply: 'Qo‘llash',
    discount: 'Chegirma',
    totalToPay: 'Jami to‘lov',
    submitOrder: 'Buyurtmani yuborish',
    submitting: 'Buyurtma yuborilmoqda...',
    orderSuccessTitle: 'Buyurtma qabul qilindi',
    orderSuccessDesc: 'Sotuvchi arizangizni Telegramda qabul qildi va tasdiqlash uchun tez orada bog‘lanadi.',
    backToCatalog: 'Katalogga qaytish',
    contactSellerTelegram: 'Sotuvchiga Telegramda yozish',
    recipient: 'Qabul qiluvchi',
    method: 'Usul',
    orderNum: (num) => `Buyurtma #${num}`,
    wantStoreBadge: 'Instagram va Telegram uchun vitrina',
    createIn2Min: 'BioMart platformasida ochish →',
  },
};

export interface DesignTranslations {
  tabTitle: string;
  pageTitle: string;
  pageSubtitle: string;
  saveChanges: string;
  unsavedBadge: string;
  savedSuccess: string;
  resetDefault: string;
  desktopPreviewNotice: string;
  mobilePreviewNotice: string;

  // 1. Style
  styleTitle: string;
  styleSubtitle: string;
  templateMinimal: string;
  templateMinimalDesc: string;
  templateWarm: string;
  templateWarmDesc: string;
  templateStreetwear: string;
  templateStreetwearDesc: string;
  templateBoutique: string;
  templateBoutiqueDesc: string;

  // 2. Accent Color
  accentTitle: string;
  accentSubtitle: string;
  customColorLabel: string;
  customColorPlaceholder: string;
  customColorPlusHint: string;

  // 3. Theme
  themeTitle: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;

  // 4. Logo & Cover
  brandingTitle: string;
  logoLabel: string;
  uploadLogo: string;
  resetLogo: string;
  coverLabel: string;
  uploadCover: string;
  removeCover: string;
  orImageUrl: string;

  // 5. Catalog View
  catalogLayoutTitle: string;
  layoutGrid: string;
  layoutList: string;

  // Extra Settings Accordion
  moreSettings: string;
  radiiTitle: string;
  radiiSharp: string;
  radiiMedium: string;
  radiiRound: string;

  buttonTextTitle: string;
  buttonBuy: string;
  buttonOrder: string;
  buttonCart: string;

  showOldPriceTitle: string;
  showOldPriceDesc: string;

  bannerTitle: string;
  bannerDesc: string;
  bannerPlaceholder: string;
  bannerCharsLeft: (count: number) => string;

  hideBrandingTitle: string;
  hideBrandingDesc: string;
  hideBrandingPlusHint: string;

  aiAssistantTitle: string;
  aiAssistantDesc: string;
  aiProHint: string;
  aiGenerateBtn: string;
}

export const designTranslations: Record<StoreLanguage, DesignTranslations> = {
  ru: {
    tabTitle: 'Дизайн',
    pageTitle: 'Дизайн витрины',
    pageSubtitle: 'Настройте внешний вид витрины за 1 минуту. Изменения видны на превью сразу.',
    saveChanges: 'Сохранить',
    unsavedBadge: 'Есть несохранённые изменения',
    savedSuccess: 'Дизайн витрины успешно сохранён!',
    resetDefault: 'Сбросить',
    desktopPreviewNotice: 'Живое превью витрины на телефоне',
    mobilePreviewNotice: 'Предпросмотр витрины',

    styleTitle: '1. Стиль витрины',
    styleSubtitle: 'Готовый стиль сразу настроит гармоничный шрифт, скругления, фон и цвета.',
    templateMinimal: 'Минимал',
    templateMinimalDesc: 'Светлый, строгий и чистый. Идеален для любой одежды, обуви и электроники.',
    templateWarm: 'Тёплая',
    templateWarmDesc: 'Кремовые тона, мягкие круглые формы. Для сладостей, кофе, уюта и подарков.',
    templateStreetwear: 'Streetwear',
    templateStreetwearDesc: 'Тёмная тема, острые углы и сочный неоновый акцент для дропов и мерча.',
    templateBoutique: 'Бутик',
    templateBoutiqueDesc: 'Элегантный заголовочный шрифт, премиум-подача для парфюма и бьюти.',

    accentTitle: '2. Цвет акцента',
    accentSubtitle: 'Цвет кнопок заказа, бейджей скидки, чипов и ключевых элементов.',
    customColorLabel: 'Свой цвет (HEX)',
    customColorPlaceholder: '#111827',
    customColorPlusHint: 'Свой HEX-цвет доступен на тарифе Plus. Выберите один из готовых образцов или перейдите на Plus.',

    themeTitle: '3. Тема оформления',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    themeSystem: 'Как в системе',

    brandingTitle: '4. Логотип и обложка',
    logoLabel: 'Логотип магазина (квадрат 1:1)',
    uploadLogo: 'Загрузить логотип',
    resetLogo: 'Сбросить логотип',
    coverLabel: 'Обложка в шапке (баннер 3:1)',
    uploadCover: 'Загрузить обложку',
    removeCover: 'Удалить обложку',
    orImageUrl: 'Или ссылка на изображение: https://...',

    catalogLayoutTitle: '5. Вид каталога',
    layoutGrid: 'Сетка (2 колонки)',
    layoutList: 'Список',

    moreSettings: 'Ещё настройки',
    radiiTitle: 'Скругления элементов',
    radiiSharp: 'Острые (2px)',
    radiiMedium: 'Средние (10px)',
    radiiRound: 'Круглые (20px)',

    buttonTextTitle: 'Текст кнопки на товаре',
    buttonBuy: '«Купить»',
    buttonOrder: '«Заказать»',
    buttonCart: '«В корзину»',

    showOldPriceTitle: 'Старая цена и скидка',
    showOldPriceDesc: 'Показывать перечёркнутую старую цену и процент скидки на карточке',

    bannerTitle: 'Баннер над каталогом',
    bannerDesc: 'Информационная строка под шапкой (например, об условиях доставки или скидке)',
    bannerPlaceholder: 'Например: Бесплатная доставка по Ташкенту при заказе от 500 000 сум!',
    bannerCharsLeft: (count: number) => `Осталось символов: ${Math.max(0, 120 - count)} / 120`,

    hideBrandingTitle: 'Скрыть плашку «Работает на BioMart»',
    hideBrandingDesc: 'Убрать водяной знак платформы внизу витрины для чистого брендинга',
    hideBrandingPlusHint: 'Скрытие водяного знака доступно на тарифе Plus или Pro.',

    aiAssistantTitle: 'AI-дизайнер витрины',
    aiAssistantDesc: 'Умный подбор идеальной палитры, шрифта и баннера под ваши фото товаров.',
    aiProHint: 'AI-функции доступны на тарифе Pro. Перейдите на тариф Pro для генерации стиля в один клик.',
    aiGenerateBtn: 'Сгенерировать стиль через AI',
  },
  uz: {
    tabTitle: 'Dizayn',
    pageTitle: 'Vitrina dizayni',
    pageSubtitle: 'Do‘koningiz ko‘rinishini 1 daqiqada sozlang. O‘zgarishlar o‘ngdagi telefonda darhol ko‘rinadi.',
    saveChanges: 'Saqlash',
    unsavedBadge: 'Saqlanmagan o‘zgarishlar mavjud',
    savedSuccess: 'Vitrina dizayni muvaffaqiyatli saqlandi!',
    resetDefault: 'Asliga qaytarish',
    desktopPreviewNotice: 'Telefondagi jonli ko‘rinish',
    mobilePreviewNotice: 'Vitrina ko‘rinishi',

    styleTitle: '1. Vitrina uslubi',
    styleSubtitle: 'Tayyor shablon mos shrift, burchaklar, fon va ranglarni avtomatik belgilaydi.',
    templateMinimal: 'Minimal',
    templateMinimalDesc: 'Yorug‘, toza va zamonaviy. Kiyim-kechak, poyabzal va aksessuarlar uchun.',
    templateWarm: 'Iliq',
    templateWarmDesc: 'Sarg‘ish iliq tuslar, yumaloq shakllar. Shirinliklar, qahva va sovg‘alar uchun.',
    templateStreetwear: 'Streetwear',
    templateStreetwearDesc: 'Qorong‘i fon, o‘tkir burchaklar va yorqin neon urg‘u — trenddagi kiyimlar uchun.',
    templateBoutique: 'Butik',
    templateBoutiqueDesc: 'Hashamatli serif shrift, go‘zallik va atirlar uchun nozik estetika.',

    accentTitle: '2. Urg‘u rangi (Aksent)',
    accentSubtitle: 'Buyurtma tugmalari, chegirma belgilari va faol bo‘limlar rangi.',
    customColorLabel: 'O‘z rangingiz (HEX)',
    customColorPlaceholder: '#111827',
    customColorPlusHint: 'O‘z HEX-rangingizni kiritish Plus tarifida mavjud. Tayyor ranglardan birini tanlang yoki Plus ga o‘ting.',

    themeTitle: '3. Ko‘rinish mavzusi',
    themeLight: 'Yorug‘',
    themeDark: 'Qorong‘i',
    themeSystem: 'Telefonga mos',

    brandingTitle: '4. Logotip va muqova',
    logoLabel: 'Do‘kon logotipi (kvadrat 1:1)',
    uploadLogo: 'Logotip yuklash',
    resetLogo: 'Logotipni tozalash',
    coverLabel: 'Tepadagi muqova (banner 3:1)',
    uploadCover: 'Muqova yuklash',
    removeCover: 'Muqovani o‘chirish',
    orImageUrl: 'Yoki rasm havolasi: https://...',

    catalogLayoutTitle: '5. Katalog ko‘rinishi',
    layoutGrid: 'To‘r (2 ustun)',
    layoutList: 'Ro‘yxat',

    moreSettings: 'Qo‘shimcha sozlamalar',
    radiiTitle: 'Burchaklar shakli',
    radiiSharp: 'O‘tkir (2px)',
    radiiMedium: 'O‘rtacha (10px)',
    radiiRound: 'Dumaloq (20px)',

    buttonTextTitle: 'Mahsulot tugmasi matni',
    buttonBuy: '«Xarid qilish»',
    buttonOrder: '«Buyurtma berish»',
    buttonCart: '«Savatga»',

    showOldPriceTitle: 'Eski narx va chegirma',
    showOldPriceDesc: 'Chizilgan eski narx va chegirma foizini kartochkada ko‘rsatish',

    bannerTitle: 'Mahsulotlar ustidagi e’lon',
    bannerDesc: 'Yetkazib berish yoki aksiya haqidagi xabar satri',
    bannerPlaceholder: 'Masalan: Toshkent bo‘ylab 500 000 so‘mdan yuqori buyurtmalarga yetkazish bepul!',
    bannerCharsLeft: (count: number) => `Qolgan belgilar: ${Math.max(0, 120 - count)} / 120`,

    hideBrandingTitle: '«BioMart» yozuvini yashirish',
    hideBrandingDesc: 'Pastdagi platforma belgisini olib tashlab, shaxsiy brend ko‘rinishini yaratish',
    hideBrandingPlusHint: 'Suv belgisini yashirish Plus yoki Pro tarifida mavjud.',

    aiAssistantTitle: 'AI vitrina dizayneri',
    aiAssistantDesc: 'Mahsulot rasmlaringizga mos ranglar, shriftlar va bannerni aqlli tanlash.',
    aiProHint: 'AI funksiyalari Pro tarifida mavjud. Bir bosishda uslub yaratish uchun Pro ga o‘ting.',
    aiGenerateBtn: 'AI orqali uslub yaratish',
  },
};

