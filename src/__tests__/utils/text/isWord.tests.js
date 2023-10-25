import { isWord } from '../../../lib/utils/text/isWord'

describe(isWord.name, function () {
  it('returns only true of smething is a string with length > 0', () => {
    [null, undefined, false, true, '', 0, 1, {}, [], () => {}]
      .forEach(val => expect(isWord(val)).toBe(false))
    ;['1' ,'0', ' ' ,'\n', '\t', 'foo']
      .forEach(val => expect(isWord(val)).toBe(true))
  })
})

