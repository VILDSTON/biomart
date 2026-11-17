import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/seller-auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { logAdminAction } from '@/lib/admin-audit';
import { SITE_DOMAIN } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const PRESET_PRODUCTS: Record<string, Array<{ title: string; price: number; description: string; images: string[] }>> = {
  clothes: [
    { title: 'Худи Oversize Heavyweight', price: 349000, description: 'Плотный премиальный хлопок 420г, свободный крой.', images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'] },
    { title: 'Футболка Vintage Wash', price: 189000, description: 'Дышащий турецкий хлопок, свободная посадка.', images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'] },
    { title: 'Брюки Cargo Relaxed', price: 399000, description: 'Удобные карманы, прочная ткань, идеальная посадка.', images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=600&q=80'] },
  ],
  shoes: [
    { title: 'Кроссовки Retro Runner White', price: 549000, description: 'Натуральная кожа, амортизирующая подошва.', images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'] },
    { title: 'Кеды Canvas Low Black', price: 299000, description: 'Классический силуэт, прочный текстиль.', images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80'] },
  ],
  perfume: [
    { title: 'Селективный парфюм «Tobacco & Vanille» 50ml', price: 420000, description: 'Богатый шлейф, стойкость до 24 часов.', images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'] },
    { title: 'Аромат «Bois Impérial» Extrait 100ml', price: 580000, description: 'Древесно-пряные ноты, хит сезона.', images: ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80'] },
  ],
  beauty: [
    { title: 'Сыворотка Hyaluronic Glow 30ml', price: 175000, description: 'Глубокое увлажнение и сияние кожи.', images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'] },
    { title: 'Крем Barrier Repair 50ml', price: 210000, description: 'Защита и восстановление липидного барьера.', images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'] },
  ],
  electronics: [
    { title: 'Беспроводные наушники Pro ANC', price: 490000, description: 'Активное шумоподавление, до 30 часов работы.', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'] },
    { title: 'Магнитный PowerBank 10000 mAh', price: 230000, description: 'Быстрая зарядка MagSafe 15W.', images: ['https://images.unsplash.com/photo-1609592424361-b4614138e0ee?auto=format&fit=crop&w=600&q=80'] },
  ],
};

export async function POST(req: NextRequest) {
  try {
    if (!verifyAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { store_name, slug: rawSlug, telegram, phone, category = 'clothes', partner_code } = body;

    if (!store_name || !store_name.trim()) {
      return NextResponse.json({ error: 'Укажите название магазина' }, { status: 400 });
    }

    const cleanSlug = (rawSlug || store_name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    if (!cleanSlug || cleanSlug.length < 2) {
      return NextResponse.json({ error: 'Некорректный адрес (slug) магазина' }, { status: 400 });
    }

    const cleanTg = (telegram || '').replace(/^@/, '').trim();
    const defaultPassword = 'bio' + Math.floor(1000 + Math.random() * 9000);

    const storePayload = {
      slug: cleanSlug,
      store_name: store_name.trim(),
      telegram_username: cleanTg || null,
      phone: phone?.trim() || null,
      plan: 'start',
      theme_settings: {
        admin_password: defaultPassword,
        accent_color: '#1F7A5A',
        theme: 'light',
        catalog_layout: 'grid',
        partner_code: partner_code?.trim() || null,
      },
    };

    let createdStoreId: string = cleanSlug;

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data: store, error: storeErr } = await supabaseAdmin
        .from('stores')
        .insert(storePayload)
        .select('id')
        .single();

      if (storeErr) {
        return NextResponse.json({ error: `Ошибка создания: ${storeErr.message}` }, { status: 400 });
      }

      createdStoreId = store.id;

      // Seed starter preset products
      const productsToSeed = PRESET_PRODUCTS[category] || PRESET_PRODUCTS.clothes;
      const productPayloads = productsToSeed.map((p) => ({
        store_id: createdStoreId,
        title: p.title,
        price: p.price,
        description: p.description,
        images: p.images,
        in_stock: true,
      }));

      await supabaseAdmin.from('products').insert(productPayloads);
    }

    await logAdminAction({
      action: 'create_quick_store',
      target_type: 'store',
      target_id: cleanSlug,
      details: { store_name, category, partner_code, telegram: cleanTg },
    });

    const storeUrl = `https://${SITE_DOMAIN}/${cleanSlug}`;
    const dashboardUrl = `https://${SITE_DOMAIN}/dashboard?auth=demo`;

    // Generated cold Instagram Direct / Telegram sales pitch message
    const outboundPitch = `Здравствуйте, ${store_name}! 👋

Мы заметили ваш крутой ассортимент в Instagram и собрали для вас готовую мобильную витрину для быстрых заказов:

🔗 Ваша персональная витрина:
${storeUrl}

✨ Как это работает для ваших продаж:
1. Вы ставите ссылку в шапку профиля Instagram (Taplink больше не нужен).
2. Клиент открывает витрину в 1 клик прямо внутри Instagram или Telegram.
3. Оформляет заказ за 10 секунд — и готовый чек с товарами и адресом сразу падает вам в Telegram!

🔑 Данные для входа в кабинет управления:
Ссылка: ${dashboardUrl}
Пароль администратора: ${defaultPassword}

Витрина полностью бесплатна для вас на 14 дней. Можете отредактировать цены и загрузить свои фото прямо сейчас!`;

    return NextResponse.json({
      success: true,
      store: {
        id: createdStoreId,
        slug: cleanSlug,
        store_name,
        store_url: storeUrl,
        admin_password: defaultPassword,
      },
      outbound_pitch: outboundPitch,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error creating quick store' }, { status: 500 });
  }
}
