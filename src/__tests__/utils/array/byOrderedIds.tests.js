import { byOrderedIds } from '../../../lib/utils/array/byOrderedIds'

describe(byOrderedIds.name, function () {
  it('throws if ids are not found in the given list of ids [empty list]', () => {
    const sorter = byOrderedIds()
    const a = { _id: 'foo' }
    const b = { _id: 'bar' }
    expect(() => sorter(a, b))
      .toThrow(`Expected foo and bar to not result in -1 and -1`)
  })
  it('throws if ids are not found in the given list of ids [a not found]', () => {
    const sorter = byOrderedIds(['bar', 'baz'])
    const a = { _id: 'foo' }
    const b = { _id: 'bar' }
    expect(() => sorter(a, b))
      .toThrow(`Expected foo and bar to not result in -1 and 0`)
  })
  it('throws if ids are not found in the given list of ids [b not found]', () => {
    const sorter = byOrderedIds(['foo', 'baz'])
    const a = { _id: 'foo' }
    const b = { _id: 'bar' }
    expect(() => sorter(a, b))
      .toThrow(`Expected foo and bar to not result in 0 and -1`)
  })
  it('sorts by given ids', () => {
    const sorter = byOrderedIds(['foo', 'bar', 'baz', 'moo'])
    const sorted = [{ _id: 'moo' }, {_id: 'foo' }, {_id: 'baz' }, {_id: 'bar'}]
    sorted.sort(sorter)
    expect(sorted).toStrictEqual([
      {_id: 'foo' }, {_id: 'bar'}, {_id: 'baz' },  { _id: 'moo' }
    ])
  })
})
