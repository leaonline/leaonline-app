import { ColorType } from 'meteor/leaonline:corelib/types/ColorType'

const colorTypeValues = Object.values(ColorType.types)

ColorType.isValid = index => index >= 0 && index <= colorTypeValues.length
ColorType.byIndex = index => ColorType.isValid(index) && colorTypeValues[index]

export { ColorType }
