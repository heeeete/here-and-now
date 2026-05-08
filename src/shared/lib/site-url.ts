const DEFAULT_SITE_URL = 'https://xn--jj0b0c714f7pd.com';

function normalizeSiteUrl(siteUrl: string): string {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '');

  if (/^https?:\/\//.test(normalizedSiteUrl)) {
    return normalizedSiteUrl;
  }

  if (normalizedSiteUrl.startsWith('localhost') || normalizedSiteUrl.startsWith('127.0.0.1')) {
    return `http://${normalizedSiteUrl}`;
  }

  return `https://${normalizedSiteUrl}`;
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
