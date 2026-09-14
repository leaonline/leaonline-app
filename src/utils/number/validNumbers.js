export const isValidNumber = num => (typeof num === 'number') && !Number.isNaN(num)

export const isValidInteger = num => isValidNumber(num) && Number.isSafeInteger(num)
