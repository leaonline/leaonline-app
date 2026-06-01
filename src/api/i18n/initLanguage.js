import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'

const defaultLocale = Meteor.settings.public.defaultLocale

export const initLanguage = async (debug = () => {}) => {
  const I18N = (await import('meteor/ostrio:i18n')).default
  const { i18n } = await import('../../api/i18n/I18n')
  const settings = (await import('../../resources/i18n/i18n_config')).default
  const { load, ...localeSettings } = settings[defaultLocale]
  const language = (await load()).default
  const i18nProvider = new I18N({
    i18n: {
      settings: { defaultLocale, [defaultLocale]: localeSettings },
      [defaultLocale]: language
    },
    helperName: '___i18n___',
    helperSettingsName: '___i18nSettings___'
  })

  i18n.load({
    get: i18nProvider.get,
    set: (locale, definitions) => i18nProvider.addl10n({ [locale]: definitions }),
    getLocale: () => i18nProvider.currentLocale.get(),
    thisContext: i18nProvider
  })

  document.documentElement.setAttribute('lang', defaultLocale)
  debug('[initLanguage]: loaded')

  // also register a language helper for templates
  Template.registerHelper('i18n', function (...args) {
    args.pop()
    return i18n.get(...args)
  })

  return i18n
}
