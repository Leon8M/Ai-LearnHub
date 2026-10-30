// Canonical site settings. Set NEXT_PUBLIC_APP_URL per environment (Vercel previews, local dev).
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://kamusi.denex.co.ke').replace(/\/+$/, '');
export const SITE_NAME = 'Kamusi AI';
export const OG_IMAGE = '/og-main.png';
// The old info@denexsoftware.co.ke has no mail (MX) records, so messages to it bounced.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'leonmunene254@gmail.com';
