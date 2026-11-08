import { ImageResponse } from 'next/og';
import { MOCK_PRODUCTS, MOCK_STORE_SETTINGS } from '@/lib/mock-data';

export const runtime = 'edge';
export const alt = 'BioMart Storefront Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const slug = params?.slug || 'tashkent_drip';
  const storeName = slug === 'tashkent_drip' ? 'TASHKENT DRIP' : slug.toUpperCase();
  const products = MOCK_PRODUCTS.slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#F7F6F2',
          padding: '44px 50px',
        }}
      >
        {/* Header with Store Logo & Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '14px',
                backgroundColor: '#1F7A5A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '26px',
                fontWeight: 'bold',
              }}
            >
              {storeName.slice(0, 2)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#1A1A1A' }}>
                  {storeName}
                </span>
                <span style={{ fontSize: '18px', color: '#1F7A5A', fontWeight: 'bold' }}>✓ Проверен</span>
              </div>
              <span style={{ fontSize: '16px', color: '#6B6B66', marginTop: '2px' }}>
                biomart.vercel.app/{slug}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#E4F1EB',
              color: '#1F7A5A',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Витрина в Instagram & Telegram
          </div>
        </div>

        {/* 4 Products Preview Row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          {products.map((p, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E7E4DC',
                overflow: 'hidden',
                padding: '12px',
              }}
            >
              <img
                src={p.images[0]}
                alt={p.title}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }}
              />
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1A1A1A',
                  marginTop: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.title}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1F7A5A',
                  marginTop: '4px',
                }}
              >
                {p.price.toLocaleString('ru-RU')} сум
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #E7E4DC',
            paddingTop: '18px',
            color: '#6B6B66',
            fontSize: '15px',
          }}
        >
          <span>Заказ в 1 клик • Чек сразу в Telegram • 0% комиссии</span>
          <span style={{ fontWeight: 'bold', color: '#1A1A1A', fontSize: '18px' }}>BioMart</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
