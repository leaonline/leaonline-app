import {
  ClozeTokenizer,
  tokenizeBlanks,
  tokenizeSelect,
  tokenizeText,
  toTokens,
  getTokenValueForFlavor
} from '../../../lib/items/cloze/ClozeTokenizer'
import { Cloze } from '../../../lib/items/cloze/Cloze'

describe('ClozeTokenizer', function () {
  describe(getTokenValueForFlavor.name, function () {
    it('throws on undefined flavour', function () {
      [-1, 0, 5, true, false, {}, undefined, null].forEach(flavor => {
        expect(() => getTokenValueForFlavor(flavor))
          .toThrow(`Unexpected flavor: ${flavor}`)
      })
    })
  })
  describe(tokenizeBlanks.name, function () {
    it('it splits a blanks value into the correct tokens', function () {
      const flavor = '99'

      expect(tokenizeBlanks(flavor, '[foo]')).toEqual([{
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 0,
        length: 3,
        value: 'foo'
      }])

      expect(tokenizeBlanks(flavor, 'ha [foo] bar')).toEqual([{
        index: 0,
        length: 3,
        value: 'ha '
      }, {
        hasPre: true,
        hasSuf: true,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 3,
        value: 'foo'
      }, {
        index: 2,
        length: 4,
        value: ' bar'
      }])
    })
    it('it splits a empty value into the correct tokens', function () {
      const flavor = '99'

      expect(tokenizeBlanks(flavor, '[foo]')).toEqual([{
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 0,
        length: 3,
        value: 'foo'
      }])

      expect(tokenizeBlanks(flavor, 'ha [foo] bar')).toEqual([{
        index: 0,
        length: 3,
        value: 'ha '
      }, {
        hasPre: true,
        hasSuf: true,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 3,
        value: 'foo'
      }, {
        index: 2,
        length: 4,
        value: ' bar'
      }])
    })
  })
  describe(tokenizeSelect.name, function () {
    it('correctly tokenizes a select value', function () {
      const flavor = '99'

      expect(tokenizeSelect(flavor, '[foo|bar]')).toEqual([{
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 0,
        length: 7,
        value: ['foo', 'bar']
      }])

      expect(tokenizeSelect(flavor, 'ha [foo|bar|baz] bar')).toEqual([{
        index: 0,
        length: 3,
        value: 'ha '
      }, {
        hasPre: true,
        hasSuf: true,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 11,
        value: ['foo', 'bar', 'baz']
      }, {
        index: 2,
        length: 4,
        value: ' bar'
      }])
    })
  })
  describe(tokenizeText.name, function () {
    it('it splits a text value into the correct tokens', function () {
      const flavor = '99'

      expect(tokenizeText(flavor, '[foo]')).toEqual([{
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 0,
        length: 3,
        value: 'foo'
      }])

      expect(tokenizeText(flavor, 'ha [foo] bar')).toEqual([{
        index: 0,
        length: 3,
        value: 'ha '
      }, {
        hasPre: false,
        hasSuf: false,
        flavor: flavor,
        isToken: true,
        index: 1,
        length: 3,
        value: 'foo'
      }, {
        index: 2,
        length: 4,
        value: ' bar'
      }])
    })
  })
  describe(toTokens.name, function () {
    it('throws on unexpected flavour', function () {
      const flavour = Math.random().toString(16)
      expect(() => toTokens({ value: `${flavour}$foo$bar` }))
        .toThrow(`Unexpected flavor - ${flavour}`)
    })
    it('throws if pattern uses an insufficient syntax', function () {
      expect(() => toTokens({ value: 'blanks$[foo]$bar$moo' }))
        .toThrow('Invalid options syntax: moo')
      expect(() => toTokens({ value: 'blanks$[foo]$bar$moo=' }))
        .toThrow('Invalid options syntax: moo')
      expect(() => toTokens({ value: 'blanks$[foo]$bar$moo=buya&bla' }))
        .toThrow('Invalid options syntax: bla')
    })
    it('allows to map splits to renderable tokens', function () {
      expect(toTokens({ value: '//' })).toEqual({
        value: '//',
        isNewLine: true
      })
      expect(toTokens({ value: 'noseparator' })).toEqual({ value: 'noseparator' })
      expect(toTokens({ value: 'blanks$foo$bar' })).toEqual({
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            index: 0,
            length: 3,
            value: 'foo'
          }
        ]
      })
      expect(toTokens({ value: 'blanks$[foo]$bar' })).toEqual({
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            flavor: 2,
            hasPre: false,
            hasSuf: false,
            index: 0,
            isToken: true,
            length: 3,
            value: 'foo'
          }
        ]
      })
      expect(toTokens({ value: 'select$[foo|baz]$bar' })).toEqual({
        flavor: 1,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            flavor: 1,
            hasPre: false,
            hasSuf: false,
            index: 0,
            isToken: true,
            length: 7,
            value: ['foo', 'baz']
          }
        ]
      })
      expect(toTokens({ value: 'empty$[foo]$bar' })).toEqual({
        flavor: 3,
        isBlock: false,
        tts: 'bar',
        value: [{
          flavor: 3,
          hasPre: false,
          hasSuf: false,
          index: 0,
          isToken: true,
          length: 3,
          value: 'foo'
        }
        ]
      })
      expect(toTokens({ value: 'text$[foo]$bar' })).toEqual({
        flavor: 4,
        isBlock: false,
        tts: 'bar',
        value: [
          {
            flavor: 4,
            hasPre: false,
            hasSuf: false,
            index: 0,
            isToken: true,
            length: 3,
            value: 'foo'
          }
        ]
      })
    })
    it('supports options but optional', function () {
      expect(toTokens({ value: 'blanks$foo$bar$color=primary' })).toEqual({
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        color: 'primary',
        value: [
          {
            index: 0,
            length: 3,
            value: 'foo'
          }
        ]
      })

      // multiple split by &
      expect(toTokens({ value: 'blanks$foo$bar$color=primary&border=dark' })).toEqual({
        flavor: 2,
        isBlock: false,
        tts: 'bar',
        color: 'primary',
        border: 'dark',
        value: [
          {
            index: 0,
            length: 3,
            value: 'foo'
          }
        ]
      })
    })
  })

  describe(ClozeTokenizer.tokenize.name, function () {
    it('tokenizes a default cloze text correctly', function () {
      const text = `{{blanks$[L]iebe$Liebe}} Frau Lang, 
{{blanks$[L]ara$Lara}} ist {{blanks$[h]eute$heute}} leider krank.`

      const { tokens, tokenIndexes } = ClozeTokenizer.tokenize({ text })
      expect(tokenIndexes).toEqual([0, 1, 2])
      expect(tokens).toEqual([
        {
          value: '',
          length: 0,
          isEmpty: true,
          index: 0
        },
        {
          isToken: true,
          value: [
            {
              itemIndex: 0,
              isToken: true,
              value: 'L',
              length: 1,
              index: 0,
              hasPre: false,
              hasSuf: true,
              flavor: 2
            },
            {
              value: 'iebe',
              length: 4,
              index: 1
            }
          ],
          length: 20,
          index: 1,
          flavor: 2,
          tts: 'Liebe',
          isBlock: false
        },
        {
          value: ' Frau Lang, ',
          length: 12,
          index: 2
        },
        {
          isToken: true,
          value: '//',
          length: 2,
          index: 3,
          isNewLine: true
        },
        {
          value: '',
          length: 0,
          isEmpty: true,
          index: 4
        },
        {
          isToken: true,
          value: [
            {
              isToken: true,
              value: 'L',
              length: 1,
              index: 0,
              hasPre: false,
              hasSuf: true,
              flavor: 2,
              itemIndex: 1
            },
            {
              value: 'ara',
              length: 3,
              index: 1
            }
          ],
          length: 18,
          index: 5,
          flavor: 2,
          tts: 'Lara',
          isBlock: false
        },
        {
          value: ' ist ',
          length: 5,
          index: 6
        },
        {
          isToken: true,
          value: [
            {
              isToken: true,
              value: 'h',
              length: 1,
              index: 0,
              hasPre: false,
              hasSuf: true,
              flavor: 2,
              itemIndex: 2
            },
            {
              value: 'eute',
              length: 4,
              index: 1
            }
          ],
          length: 20,
          index: 7,
          flavor: 2,
          tts: 'heute',
          isBlock: false
        },
        {
          value: ' leider krank.',
          length: 14,
          index: 8
        }
      ])
    })
    it('tokenizes a cloze text in table mode correctly', function () {
      const text = `Die Zahl:  || 41 || {{blanks$[26]$}} || 19 || {{blanks$[21]$}} || {{blanks$[44]$}}           
Das Doppelte: || {{blanks$[82]$}} || 52  || {{blanks$[38]$}} || 42 || 88`
      const { tokens, tokenIndexes } = ClozeTokenizer.tokenize({ text, isTable: true })
      expect(tokenIndexes).toEqual([0, 1, 2, 3, 4])
      expect(tokens).toEqual([
        // 1. row
        [
          {
            value: 'Die Zahl:',
            length: 9,
            index: 0
          },
          {
            value: '41',
            length: 2,
            index: 1
          },
          {
            isToken: true,
            value: [
              {
                isToken: true,
                itemIndex: 0,
                value: '26',
                length: 2,
                index: 0,
                hasPre: false,
                hasSuf: false,
                flavor: 2
              }
            ],
            length: 12,
            index: 2,
            flavor: 2,
            tts: '',
            isBlock: false
          },
          {
            value: '19',
            length: 2,
            index: 3
          },
          { // ||
            isToken: true,
            value: [
              {
                isToken: true,
                value: '21',
                itemIndex: 1,
                length: 2,
                index: 0,
                hasPre: false,
                hasSuf: false,
                flavor: 2
              }
            ],
            length: 12,
            index: 4,
            flavor: 2,
            tts: '',
            isBlock: false
          },
          {
            isToken: true,
            value: [
              {
                isToken: true,
                value: '44',
                itemIndex: 2,
                length: 2,
                index: 0,
                hasPre: false,
                hasSuf: false,
                flavor: 2
              }
            ],
            length: 12,
            index: 5,
            flavor: 2,
            tts: '',
            isBlock: false
          }
        ],
        // 2. row
        [
          {
            value: 'Das Doppelte:',
            length: 13,
            index: 0
          },
          {
            isToken: true,
            value: [
              {
                isToken: true,
                value: '82',
                itemIndex: 3,
                length: 2,
                index: 0,
                hasPre: false,
                hasSuf: false,
                flavor: 2
              }
            ],
            length: 12,
            index: 1,
            flavor: 2,
            tts: '',
            isBlock: false
          },
          {
            value: '52',
            length: 2,
            index: 2
          },
          {
            isToken: true,
            value: [
              {
                isToken: true,
                value: '38',
                itemIndex: 4,
                length: 2,
                index: 0,
                hasPre: false,
                hasSuf: false,
                flavor: 2
              }
            ],
            length: 12,
            index: 3,
            flavor: 2,
            tts: '',
            isBlock: false
          },
          {
            value: '42',
            length: 2,
            index: 4
          },
          {
            value: '88',
            length: 2,
            index: 5
          }
        ]
      ])
    })
    it('tokenizes a cloze table with empties', function () {
      const text = `<<>>  ||  1  ||  7

+ || 6 || 9 

<<>> || {{empty$[1]$$pattern=0123456789}} || <<>>

<<>> || {{blanks$[8]$$cellBorder=top&pattern=0123456789}} || {{blanks$[6]$$cellBorder=top&pattern=0123456789}}`
      const { tokens, tokenIndexes } = ClozeTokenizer.tokenize({ text, isTable: true })
      expect(tokenIndexes).toEqual([0, 1])
      expect(tokens).toEqual([
        // 1. row
        [
          {
            index: 0,
            isCellSkip: true,
            length: 4,
            value: '<<>>'
          },
          {
            index: 1,
            length: 1,
            value: '1'
          },
          {
            index: 2,
            length: 1,
            value: '7'
          }
        ],
        // 2. row
        [
          {
            index: 0,
            length: 1,
            value: '+'
          },
          {
            index: 1,
            length: 1,
            value: '6'
          },
          {
            index: 2,
            length: 1,
            value: '9'
          }
        ],
        // 3, row
        [
          {
            index: 0,
            isCellSkip: true,
            length: 4,
            value: '<<>>'
          },
          {
            index: 1,
            flavor: 3,
            isBlock: false,
            isToken: true,
            length: 29,
            pattern: '0123456789',
            tts: '',
            value: [
              {
                // empties should not have an
                // itemIndex as they are considered
                // non-grade-able
                flavor: Cloze.flavor.empty.value,
                hasPre: false,
                hasSuf: false,
                index: 0,
                isToken: true,
                length: 1,
                value: '1'
              }
            ]
          },
          {
            index: 2,
            isCellSkip: true,
            length: 4,
            value: '<<>>'
          }
        ],
        // 4. row
        [
          {
            index: 0,
            isCellSkip: true,
            length: 4,
            value: '<<>>'
          },
          {
            cellBorder: 'top',
            flavor: Cloze.flavor.blanks.value,
            index: 1,
            isBlock: false,
            isToken: true,
            length: 45,
            pattern: '0123456789',
            tts: '',
            value: [
              {
                itemIndex: 0,
                flavor: Cloze.flavor.blanks.value,
                hasPre: false,
                hasSuf: false,
                index: 0,
                isToken: true,
                length: 1,
                value: '8'
              }
            ]
          },
          {
            cellBorder: 'top',
            flavor: Cloze.flavor.blanks.value,
            index: 2,
            isBlock: false,
            isToken: true,
            length: 45,
            pattern: '0123456789',
            tts: '',
            value: [
              {
                itemIndex: 1,
                flavor: Cloze.flavor.blanks.value,
                hasPre: false,
                hasSuf: false,
                index: 0,
                isToken: true,
                length: 1,
                value: '6'
              }
            ]
          }
        ]
      ])
    })
  })
})
