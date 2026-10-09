import { Legal } from '../../../contexts/Legal'

export const loadAccountData = () => {
  const legal = Legal.collection().findOne()
  return { legal }
}
