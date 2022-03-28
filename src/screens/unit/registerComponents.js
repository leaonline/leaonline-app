import { UnitContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import { PlainTextRenderer } from '../../components/renderer/text/PlainTextRenderer'
import { MarkdownRenderer } from '../../components/renderer/text/Markdown'
import { ImageRenderer } from '../../components/renderer/media/ImageRenderer'
import { ChoiceRenderer } from '../../components/renderer/item/ChoiceRenderer'
import { HighlightRenderer } from '../../components/renderer/item/HighlightRenderer'

import { Scoring } from '../../scoring/Scoring'
import { scoreHighlight } from '../../items/highlight/scoring'
import { ClozeRenderer } from '../../components/renderer/item/ClozeRenderer'
import { scoreCloze } from '../../items/cloze/scoring'

// /////////////////////////////////////////////////////////////////////////////
//
// display elements
//
// /////////////////////////////////////////////////////////////////////////////

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

// /////////////////////////////////////////////////////////////////////////////
//
// ITEMS
//
// /////////////////////////////////////////////////////////////////////////////

// cloze

UnitContentElementFactory.register({
  type: 'item',
  subtype: 'cloze',
  component: ClozeRenderer
})

Scoring.register({
  type: 'item',
  subtype: 'cloze',
  scoreFn: scoreCloze
})


// choice

UnitContentElementFactory.register({
  type: 'item',
  subtype: 'choice',
  component: ChoiceRenderer
})

// highlight

UnitContentElementFactory.register({
  type: 'item',
  subtype: 'highlight',
  component: HighlightRenderer
})

Scoring.register({
  type: 'item',
  subtype: 'highlight',
  scoreFn: scoreHighlight
})
