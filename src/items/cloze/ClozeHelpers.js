import { Cloze } from './Cloze'

export const ClozeHelpers = {}

ClozeHelpers.isBlank = flavor => flavor === Cloze.flavor.blanks.value

ClozeHelpers.isSelect = flavor => flavor === Cloze.flavor.select.value

ClozeHelpers.isEmpty = flavor => flavor === Cloze.flavor.empty.value

ClozeHelpers.isText = flavor => flavor === Cloze.flavor.text.value

ClozeHelpers.getFlavor = flavor => Cloze.flavor[flavor]?.value
