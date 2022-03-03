import { UnitContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import { PlainTextRenderer } from '../../components/renderer/text/PlainTextRenderer'
import { MarkdownRenderer } from '../../components/renderer/text/Markdown'
import { ImageRenderer } from '../../components/renderer/media/ImageRenderer'
import { ChoiceRenderer } from '../../components/renderer/item/ChoiceRenderer'
import { HighlightRenderer } from '../../components/renderer/item/HighlightRenderer'

UnitContentElementFactory.register({
  type: 'text',
  subtype: 'text',
  component: PlainTextRenderer
})

UnitContentElementFactory.register({
  type: 'text',
  subtype: 'markdown',
  component: MarkdownRenderer
})

UnitContentElementFactory.register({
  type: 'media',
  subtype: 'image',
  component: ImageRenderer
})

// items

UnitContentElementFactory.register({
  type: 'item',
  subtype: 'choice',
  component: ChoiceRenderer
})

UnitContentElementFactory.register({
  type: 'item',
  subtype: 'highlight',
  component: HighlightRenderer
})