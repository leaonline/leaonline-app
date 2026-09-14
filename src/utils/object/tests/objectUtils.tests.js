/* eslint-env mocha */
import { expect } from 'chai'
import { getType } from '../getType'
import { hasProperty } from '../hasProperty'
import { isPlainObject } from '../isPlainObject'

class ES6CustomWhatever {
  get [Symbol.toStringTag] () {
    return 'ES6CustomWhatever'
  }
}

describe('object utils', function () {
  describe(getType.name, function () {
    it('returns the constructor name of a given Object', function () {
      expect(getType(null)).to.equal('[object Null]')
      expect(getType()).to.equal('[object Undefined]')
      expect(getType(1)).to.equal('[object Number]')
      expect(getType('')).to.equal('[object String]')
      expect(getType({})).to.equal('[object Object]')
      expect(getType([])).to.equal('[object Array]')
      expect(getType(new Date())).to.equal('[object Date]')
      expect(getType(() => {})).to.equal('[object Function]')
      expect(getType(new ES6CustomWhatever())).to.equal('[object ES6CustomWhatever]')
    })
  })
  describe(hasProperty.name, function () {
    it('is a safer shorthand for hasOwnProperty', function () {
      const obj = { foo: 'bar' }
      expect(hasProperty(obj, 'foo')).to.equal(true)
      expect(hasProperty(obj, 'toString')).to.equal(false) // not own prop
    })
  })
  describe(isPlainObject.name, function () {
    it('determines if an object is plain', function () {
      expect(isPlainObject(() => {})).to.equal(false)
      expect(isPlainObject([])).to.equal(false)
      expect(isPlainObject(1)).to.equal(false)
      expect(isPlainObject('')).to.equal(false)
      expect(isPlainObject(true)).to.equal(false)
      expect(isPlainObject(Date)).to.equal(false)
      expect(isPlainObject(new Date())).to.equal(false)
      expect(isPlainObject(ES6CustomWhatever)).to.equal(false)
      expect(isPlainObject(new ES6CustomWhatever())).to.equal(false)

      expect(isPlainObject({})).to.equal(true)
    })
  })
})
