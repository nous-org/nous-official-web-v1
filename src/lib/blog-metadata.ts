import type { Locale } from '@/lib/i18n';

export type OriginalLanguage = 'en' | 'es';

export function normalizeOriginalLanguage(value: unknown, fallback: OriginalLanguage = 'en'): OriginalLanguage {
  const normalized = String(value || '').trim().toLowerCase();

  if (['es', 'esp', 'español', 'espanol', 'spanish'].includes(normalized)) {
    return 'es';
  }

  if (['en', 'eng', 'english', 'inglés', 'ingles'].includes(normalized)) {
    return 'en';
  }

  return fallback;
}

export function getOriginalLanguageLabel(language: OriginalLanguage, locale: Locale = 'en'): string {
  if (locale === 'es') {
    return language === 'es' ? 'Original: Español' : 'Original: Inglés';
  }

  return language === 'es' ? 'Original: Spanish' : 'Original: English';
}

export function getBlogAuthorRole(name: string, fallback = ''): string {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('roberto')) return 'Chief Executive Officer (CEO) & Founder';
  if (lowerName.includes('alessandro')) return 'Chief Technology Officer (CTO) & Co-Founder';
  if (lowerName.includes('andrey')) return 'Chief Product Officer (CPO) & Co-Founder';
  if (lowerName.includes('jefry')) return 'Chief Marketing Officer (CMO)';

  return fallback;
}
