export const InstructionAnimations = {}

const instructions = new Map()

InstructionAnimations.register = (key, ref) => instructions.set(key, ref)


InstructionAnimations.get = key => instructions.get(key)
