import { hasOwnProp } from '../../../lib/utils/object/hasOwnProp'

describe(hasOwnProp.name, function () {
  it('returns true only for own props', () => {
    const obj = { foo: 'bar' }
    expect(hasOwnProp(obj, 'foo')).toBe(true)

    class A {
      foo () { return 1 }
    }
    const a = new A()
    expect(hasOwnProp(a, 'foo')).toBe(false)
  })
})
