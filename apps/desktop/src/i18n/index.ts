import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en'
import zh from './locales/zh'

export type SupportedLocale = 'en' | 'zh'

export const SUPPORTED_LOCALES: { code: SupportedLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' }
]

const STORAGE_KEY = 'hermes_locale'

function resolveInitial(): SupportedLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {}

  if (typeof navigator !== 'undefined') {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language || 'en']

    for (const lang of langs) {
      const lower = (lang || '').toLowerCase()
      if (lower.startsWith('zh')) return 'zh'
      if (lower.startsWith('en')) return 'en'
    }
  }

  return 'en'
}

export function setLocale(locale: SupportedLocale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {}

  void i18next.changeLanguage(locale)
}

void i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh }
  },
  lng: resolveInitial(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
  returnNull: false
})
