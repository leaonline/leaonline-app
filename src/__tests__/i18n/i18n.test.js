import i18n from '../../lib/i18n'

const translationEN = i18n.getDataByLanguage('en')
const translationDE = i18n.getDataByLanguage('de')

test('recursively iterate all object keys of i18 EN and DE, checks if the same namespaces exists, if namespaces have the same length', () => {
  const isPlainObj = obj => Object.prototype.toString.call(obj) === '[object Object]'
  const equal = (a, b) => {
    const keysa = Object.keys(a).sort()
    const keysb = Object.keys(b).sort()

    if (keysa.length !== keysb.length) {
      return false
    }

    if (keysa.toString() !== keysb.toString()) {
      return false
    }

    return keysa.every(key => {
      const valuea = a[key]
      const valueb = b[key]
      const typea = typeof valuea
      const typeb = typeof valueb

      if (typea !== typeb) { return false }
      if (typea === 'string') { return true }
      if (!isPlainObj(valuea) || !isPlainObj(valueb)) { return false }

      return equal(valuea, valueb)
    })
  }

  expect(equal(translationEN, translationDE)).toBe(true)
})
