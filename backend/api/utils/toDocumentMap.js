export const toDocumentMap = ({ list, key }) => {
  const map = new Map()
  list.forEach(doc => {
    map.set(doc[key], doc)
  })
  return map
}
