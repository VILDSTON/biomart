import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BioMart — Витрина для Instagram и Telegram',
  description: 'Быстрый мобильный каталог товаров с оформлением заказа прямо в Telegram продавца.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'BioMart — Витрина для Instagram и Telegram',
    description: 'Оформление заказа без регистрации. Чек улетает прямо в Telegram продавца.',
    siteName: 'BioMart',
    locale: 'ru_RU',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F6F2' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

const themeScript = `(function() {
  try {
    var saved = localStorage.getItem('biomart_theme');
    var isDark = saved === 'dark'; // Light theme by default as per design system contract
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch(e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-[100dvh] bg-page text-content-primary antialiased m-0 p-0 selection:bg-accent/20 overflow-x-clip">
        {children}
      </body>
    </html>
  );
}
