export const Cloze = {}

Cloze.name = 'cloze'
Cloze.label = 'item.cloze.title'
Cloze.icon = 'align-left'
Cloze.MAX_LENGTH = 10000
Cloze.isItem = true

Cloze.flavor = {
  /**
   * A simple select-box, single-choice style
   */
  select: {
    name: 'select',
    value: 1
  },
  /**
   * Default, text-input
   */
  blanks: {
    name: 'blanks',
    value: 2
  },
  /**
   * Text-input that is not linked to any scoring. use as distractor or
   * placeholder or supplemental element.
   */
  empty: {
    name: 'empty',
    value: 3
  },
  /**
   * Text-block that wraps text with optional tts
   */
  text: {
    name: 'text',
    value: 4
  }
}

Cloze.subtypes = {
  text: 'clozeText',
  select: 'clozeSelect',
  table: 'clozeTable'
}

Cloze.getSubtype = value => {
  if (value.isTable) {
    return Cloze.subtypes.table
  }
  const hasSelect = value.text.includes('{{select')
  return hasSelect
    ? Cloze.subtypes.select
    : Cloze.subtypes.text
}
