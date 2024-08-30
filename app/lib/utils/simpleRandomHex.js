/**
 * Generates a simple random hex string.
 * Uses Math.random so use it only for simple things.
 * @param {number } [len=6]
 * @return {string}
 */
export const simpleRandomHex = (len = 6) => {
  const n = Math.random()
  const s = String(n.toFixed(len)).split('.')[1]
  return Number(s).toString(16)
}
