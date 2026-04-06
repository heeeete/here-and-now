import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'https://지금여기.com'); // 실제 도메인으로 변경 필요

export const metadata: Metadata = {
  title: '지금여기 | 지도에 기록 남기기',
  description: '지도 위에 지금 일어나고 있는 일들을 실시간으로 기록하고 공유해보세요.',
  keywords: ['지도', '기록', '실시간', '지금여기', '장소', '공유', '현장'],
  authors: [{ name: '지금여기 팀' }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: '지금여기 | 지도에 기록 남기기',
    description: '지도 위에 지금 일어나고 있는 일들을 실시간으로 기록하고 공유해보세요.',
    url: SITE_URL,
    siteName: '지금여기',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // public/og-image.png 파일을 만들어주세요!
        width: 1200,
        height: 630,
        alt: '지금여기 서비스 미리보기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '지금여기 | 지도에 기록 남기기',
    description: '지도 위에 지금 일어나고 있는 일들을 실시간으로 기록하고 공유해보세요.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;

  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head></head>
      <body className="flex min-h-full flex-col">
        {naverMapClientId && (
          <Script
            src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapClientId}&submodules=geocoder`}
            strategy="beforeInteractive"
          />
        )}

        <main className="flex-1">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
