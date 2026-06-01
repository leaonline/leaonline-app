import { onServer } from '../../utils/archUtils'
import { getCollection } from '../utils/getCollection'

export const createGetMethod = ({ context, run, backendOnly = true }) => {
  return {
    name: `${context.name}.methods.get`,
    backend: backendOnly,
    schema: {
      _id: String
    },
    run: onServer(run || async function ({ _id }) {
      return getCollection(context.name).findOneAsync({ _id })
    })
  }
}
