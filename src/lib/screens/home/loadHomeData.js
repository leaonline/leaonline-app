import { Field } from '../../contexts/Field'

export const loadHomeData = async () => {
  return Field.collection().find().fetch()
}
