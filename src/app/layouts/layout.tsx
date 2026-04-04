import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import '../styles/globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '지금여기 | 지도에 기록 남기기',
  description: '지도 위에 지금 기록을 공유하세요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;

  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {naverMapClientId && (
          <Script
            src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapClientId}&submodules=geocoder`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="flex min-h-full flex-col">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
