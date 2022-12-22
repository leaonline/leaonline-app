export const isValidNumber = n => {
  if (typeof n !== 'number') return false
  if (Number.isNaN(n)) return false
  if (!Number.isFinite(n)) return false

  return n > 0
    ? +n < Number.MAX_VALUE
    : -n < Number.MAX_VALUE
}
