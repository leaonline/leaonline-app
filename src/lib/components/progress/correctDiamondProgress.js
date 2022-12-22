import { isValidNumber } from '../../utils/isValidNumber'
/**
 * Due to the diamond's form we often see
 * very low values (below .3) or high values (> .75)
 * as either not existent or as complete full.
 * With this little correction we make it visually
 * nicer.
 * @param value {number}
 * @return {number}
 */

export const correctDiamondProgress = (value) => {
  if (!isValidNumber(value)) return 0
  if (value < 0) return 0
  if (value > 0 && value < 0.3) return 0.3
  if (value > 0.75 && value < 0.9) return 0.75
  if (value >= 0.9 && value <= 1) return 1
  if (value > 1) return 1
  return value
}
