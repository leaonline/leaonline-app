import { InstructionAnimations } from './instructions/InstructionAnimations'
import { ChoiceTextInstructions } from './instructions/ChoiceTextInstructions'
import { ChoiceImageInstructions } from './instructions/ChoiceImageInstructions'
import { Choice } from '../../items/choice/Choice'
import { Highlight } from '../../items/highlight/Highlight'
import { HighlightInstructions } from './instructions/HighlightInstructions'
import { Connect } from '../../items/connect/Connect'
import { ConnectInstructions } from './instructions/ConnectInstructions'

InstructionAnimations.register(Choice.subtypes.choiceText, ChoiceTextInstructions)
InstructionAnimations.register(Choice.subtypes.choiceImage, ChoiceImageInstructions)
InstructionAnimations.register(Highlight.subtypes.default, HighlightInstructions)
InstructionAnimations.register(Connect.subtypes.default, ConnectInstructions)
