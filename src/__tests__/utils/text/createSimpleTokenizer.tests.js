import { createSimpleTokenizer } from '../../../lib/utils/text/createSimpleTokenizer'
import { isWord } from '../../../lib/utils/text/isWord'

describe(createSimpleTokenizer.name, function () {
  it ('returns an empty array if input is not a string of length > 0',  () => {
    const tokenize = createSimpleTokenizer('[', ']')

    ;[null, undefined, false, true, '', 0, 1, {}, [], () => {}]
      .forEach(val => {
        expect(tokenize(val)).toStrictEqual([])
      })
  })
})

