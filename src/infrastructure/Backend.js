import { callMeteor } from '../meteor/call'
export const Backend = {}

Backend.

Backend.fetchData = async ({ name, schema, args }) => {
  const data = await callMeteor({
    name: `${name}.methods.get`,
    args: args,
    prepare: prepare,
    receive: receive
  })

  if (schema) schema.validate(data)

  return data
}