/**
 * Given the amount of elements (`n`) it returns
 * the positions on the circle for each element,
 * where all elements are evenly distributed across
 * the full spectrum (0..TWO_PI)
 * @param n {number}
 * @param radius {number}
 * @return {Array<{ x: number, y: number }>}
 */
export const getPositionOnCircle = ({ n, radius }) => {
  const positions = []
  positions.length = n

  for (let i = 0; i < n; i++) {
    const angle = i * (Math.PI / (n / 2))

    positions[i] = {
      x: radius + (radius * Math.cos(angle)),
      y: radius + (radius * Math.sin(angle))
    }
  }

  return positions
}
