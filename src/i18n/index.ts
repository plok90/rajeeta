import en from './en.json'
import ar from './ar.json'

export type Locale = 'en' | 'ar'

const translations = { en, ar }

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en
}

export function getDirection(locale: Locale) {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
