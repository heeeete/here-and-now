import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://지금여기.com'; // 실제 도메인으로 변경 필요

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'always', // 지도의 기록은 실시간으로 변하므로
      priority: 1.0,
    },
    // 추후 기록 상세 페이지나 장소별 페이지가 생기면 이곳에 동적으로 배열을 추가합니다.
  ];
}
