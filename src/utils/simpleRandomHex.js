export const simpleRandomHex = (len = 6) => {
  const n = Math.random()
  const s = String(n.toFixed(len)).split('.')[1]
  return Number(s).toString(16)
}
