import i18n from '../../i18n'

const translationEN = i18n.getDataByLanguage('en')
const translationDE = i18n.getDataByLanguage('de')

test('check if the same namespaces exists in DE and EN', () => {
  expect(Object.keys(translationEN)).toEqual(Object.keys(translationDE))
})

test('check if the namespaces in DE and EN have the same values', () => {
  const valuesEN = Object.keys(translationEN).map(key => Object.keys(i18n.getResourceBundle('en', key)))
  const valuesDE = Object.keys(translationDE).map(key => Object.keys(i18n.getResourceBundle('de', key)))

  expect(valuesDE).toEqual(valuesEN)
})
