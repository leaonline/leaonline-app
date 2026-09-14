import { i18n } from './I18n'

/**
 * Receives an object with locale-implementations and tries to fetch a
 * translation for the current locale. If no translation for this locale is
 * defined, it simply skips.
 *
 * The language impl MUST be imported via dynamic import!
 *
 * Supported results are either JSON format or default export Objects,
 * named exports are not supported!
 *
 * @example
 * addToLanguage({
 *   en: () => import('../i18n/en.json'),
 *   de: () => import('../i18n/de.js')
 * })
 *
 *
 * @param languages {Object}
 * @return {Promise<Boolean>}
 */

export const addToLanguage = async languages => {
  const locale = i18n.getLocale()
  const importFn = languages[locale]

  if (!importFn) {
    // TODO add debug message
    return false
  }

  const definitions = await importFn()

  if (typeof definitions !== 'object' || definitions === null) {
    // TODO add debug message
    return false
  }

  i18n.set(locale, definitions.default || definitions)
  return true
}
