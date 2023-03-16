import { InstructionAnimations } from './instructions/InstructionAnimations'
import { Cloze } from '../../items/cloze/Cloze'
import { Choice } from '../../items/choice/Choice'
import { Highlight } from '../../items/highlight/Highlight'
import { Connect } from '../../items/connect/Connect'
import { HighlightInstructions } from './instructions/HighlightInstructions'
import { ChoiceTextInstructions } from './instructions/ChoiceTextInstructions'
import { ChoiceImageInstructions } from './instructions/ChoiceImageInstructions'
import { ConnectInstructions } from './instructions/ConnectInstructions'
import { ClozeTextInstructions } from './instructions/ClozeTextInstructions'
import { ClozeSelectInstructions } from './instructions/ColozeSelectInstructions'

InstructionAnimations.register(Choice.subtypes.choiceText, ChoiceTextInstructions)
InstructionAnimations.register(Choice.subtypes.choiceImage, ChoiceImageInstructions)
InstructionAnimations.register(Highlight.subtypes.default, HighlightInstructions)
InstructionAnimations.register(Connect.subtypes.default, ConnectInstructions)
InstructionAnimations.register(Cloze.subtypes.text, ClozeTextInstructions)
InstructionAnimations.register(Cloze.subtypes.table, ClozeTextInstructions)
InstructionAnimations.register(Cloze.subtypes.select, ClozeSelectInstructions)
