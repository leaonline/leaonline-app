export const unitPageHasItem = ({ unitDoc, page }) => {
  const content = unitDoc?.pages?.[page]?.content

  if (!Array.isArray(content)) {
    return false
  }

  return content.some(el => el.type === 'item')
}
