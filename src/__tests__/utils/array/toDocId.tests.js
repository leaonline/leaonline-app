import { toDocId } from '../../../lib/utils/array/toDocId'

describe(toDocId.name, function () {
  it('maps objects to their doc ids', () => {
    expect([{ _id: 'foo'}, { _id: 'bar'}].map(toDocId))
      .toStrictEqual(['foo', 'bar'])
  })
})

