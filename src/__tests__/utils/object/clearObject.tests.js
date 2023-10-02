import { clearObject } from '../../../lib/utils/object/clearObject'

describe(clearObject.name, function () {
  it('removes all own properties of an object', () => {
    const obj = { foo: 'bar' }
    clearObject(obj)
    expect(obj).toStrictEqual({})
    expect(typeof obj.toString).toBe('function')
  })
  it('throws if obj is not an object', () => {
    [[], null, undefined, 1, 1.2, '1', false, true, () => {}]
      .forEach(value => {
        expect(() => clearObject(value))
          .toThrow(`Expected objected, got ${typeof value}`)
      })
  })
})

