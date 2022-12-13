export const computeProgress = ({ current = 0, max = 1 }) => {
  let currentValue = (current + 1) / (max + 1)

  if (currentValue < 0) currentValue = 0
  if (currentValue > 1) currentValue = 1
  if (Number.isNaN(currentValue) || !Number.isFinite(currentValue)) {
    currentValue = 0
  }

  return currentValue
}
