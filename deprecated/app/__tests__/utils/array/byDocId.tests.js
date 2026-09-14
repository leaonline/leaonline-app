import { byDocId } from '../../../lib/utils/array/byDocId'

describe(byDocId.name, function () {
  it('helps to find the doc id in target', () => {
    const _id = 'foo'
    const matcher = byDocId(_id)
    expect(matcher({ _id })).toBe(true)
    expect(matcher({ _id: 'bar' })).toBe(false)
    expect(matcher({})).toBe(false)
    expect(matcher([])).toBe(false)
    expect(matcher(new Date())).toBe(false)
    expect(matcher()).toBe(false)

    const filtered = [{ _id }, { _id }, { _id: 'bar' }, { _id }, { _id }].filter(matcher)
    expect(filtered.length).toBe(4)
  })
})
