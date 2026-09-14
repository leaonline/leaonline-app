import { toPrecisionNumber } from '../number/toPrecisionNumber'

/**
 * Given the amount of elements (`n`) it returns
 * the positions on the circle for each element,
 * where all elements are evenly distributed across
 * the full spectrum (0..TWO_PI)
 * TODO move to math folder
 * @param n {number}
 * @param radius {number}
 * @return {Array<{ x: number, y: number }>}
 */
export const getPositionOnCircle = ({ n, radius, precision = 5 }) => {
  const positions = []
  positions.length = n

  for (let i = 0; i < n; i++) {
    const angle = i * (Math.PI / (n / 2))

    positions[i] = {
      x: toPrecisionNumber(radius + (radius * Math.cos(angle)), precision),
      y: toPrecisionNumber(radius + (radius * Math.sin(angle)), precision)
    }
  }

  return positions
}
