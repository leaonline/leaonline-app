import { onServer } from '../../utils/archUtils'
import { getCollection } from '../utils/getCollection'
import { createLog } from "../../utils/createLog";

export const createGetMethod = ({ context, run, backendOnly = true, debug }) => {
    const contextname = context.name
    const methodName = `${contextname}.methods.get`
    const prefix = `[${contextname}][${methodName}]:`
    const _debug = debug ?? createLog({ name: context.name, level: 'debug' })
  return {
    name: methodName,
    backend: backendOnly,
    schema: {
      _id: String
    },
    run: onServer(run || async function ({ _id }) {
      const document = await getCollection(context.name).findOneAsync({ _id })
        _debug(prefix, _id, `found=${!!document}`)
      return document
    })
  }
}
