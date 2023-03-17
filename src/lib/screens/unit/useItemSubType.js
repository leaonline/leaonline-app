import { useEffect, useState } from 'react'
import { isDefined } from '../../utils/isDefined'
import { ItemRegistry } from '../../items/ItemRegistry'

export const useItemSubType = ({ unitDoc, page }) => {
  const [subtype, setSubtype] = useState(null)

  useEffect(() => {
    if (!isDefined(page) || !isDefined(page)) {
      return
    }

    const item = unitDoc.pages[page].content.find(entry => entry.type === 'item')
    if (!isDefined(item?.subtype)) { return }

    const ItemDef = ItemRegistry.get(item.subtype)

    if (!isDefined(ItemDef) || !isDefined(ItemDef.getSubtype)) {
      return
    }

    const currentSubtype = ItemDef.getSubtype(item.value)

    if (currentSubtype) {
      setSubtype(currentSubtype)
    }
  }, [unitDoc, page])

  return { subtype }
}
