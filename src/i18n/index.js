import { createI18n } from 'vue-i18n'

const loadMessages = () => {
  const locales = require.context('@/i18n/locales', true, /[\w-]+\.json$/i)
  return locales.keys().reduce((locs, loc) => ({ ...locs, [loc.replace(/\.|\/|json/g, '')]: locales(loc) }), {})
}

export default createI18n({
  locale: 'it',
  fallbackLocale: 'en',
  messages: loadMessages(),
  datetimeFormats: {
    'en': {
      long: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      }
    },
    'it': {
      long: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'long'
      }
    }
  }
 })
