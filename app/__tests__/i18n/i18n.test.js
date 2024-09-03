import { i18n } from '../../lib/i18n'

const translationEN = i18n.getDataByLanguage('en')
const translationDE = i18n.getDataByLanguage('de')

test('recursively iterate all object keys of i18 EN and DE, checks if the same namespaces exists, if namespaces have the same length', () => {
  const toKeys = (obj, keys = [], path = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const type = typeof value
      if (value === null || (type !== 'object' && type !== 'string')) {
        throw new Error(`Expected object|string, got ${value}`)
      }
      const newPath = `${path}.${key}`
      if (type === 'string') {
        keys.push(newPath)
      }
      else {
        toKeys(value, keys, newPath)
      }
    })
    return keys
  }
  const byName = (a,b) => a.localeCompare(b)
  const deKeys = toKeys(translationDE).sort(byName)
  const enKeys = toKeys(translationEN).sort(byName)

  expect(deKeys).toEqual(enKeys)
})
