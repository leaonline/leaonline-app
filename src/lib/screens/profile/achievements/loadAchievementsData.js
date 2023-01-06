import { Dimension } from '../../../contexts/Dimension'
import { Field } from '../../../contexts/Field'
import { ColorTypeMap } from '../../../constants/ColorTypeMap'

export const loadAchievementsData = async () => {
  const fields = Field.collection().find().fetch()
  const dimensions = Dimension.collection()
    .find()
    .fetch()
    .map(element => {
    const copy = { ...element}
    copy.progress = Math.floor(Math.random() * 100),
    copy.color = ColorTypeMap.get(element.colorType)
    copy.competencies = {}
    fields.forEach(fieldDoc => {
      copy.competencies[fieldDoc._id] = { value: Math.floor(Math.random() * 5) }
    })
    return copy
  })

  return {
    dimensions,
    fields
  }
}
