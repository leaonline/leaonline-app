import { isDefined } from '../../../lib/utils/object/isDefined'

describe(isDefined.name, function () {
  it('returns only true if something is not undefined and not null', () => {
    [undefined, null].forEach(val => expect(isDefined(val)).toBe(false))

    ;[true, false, 'a', 1, 0, '0', () => {}, []]
      .forEach(val => expect(isDefined(val)).toBe(true))
  })
})

