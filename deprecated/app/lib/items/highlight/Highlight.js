export const Highlight = {}

Highlight.name = 'highlight'
Highlight.label = 'item.highlight.title'
Highlight.icon = 'highlighter'
Highlight.isItem = true

Highlight.subtypes = {
  default: 'highlightDefault'
}

Highlight.getSubtype = () => Highlight.subtypes.default
