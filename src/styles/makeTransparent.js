export const makeTransparent = (color, transparency ) => {
  if (!color.includes('#')) {
    throw new Error('makeTransparent can only handle hex colors for now')
  }

  // mapping range 0-1 to 0-255
  let correctedTransparency = Math.round(transparency * 255)

  if (correctedTransparency < 0) {
    correctedTransparency = 0
  }

  if (correctedTransparency > 255) {
    correctedTransparency = 255
  }

  const hexTransparency = correctedTransparency.toString(16)

  return `${color}${hexTransparency}`
}
