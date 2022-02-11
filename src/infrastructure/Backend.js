import { callMeteor } from '../meteor/call'
export const Backend = {}

Backend.fetchData = async ({ name, schema, args, prepare, receive }) => {
  const data = await callMeteor({
    name: `${name}.methods.get`,
    args: args,
    prepare: prepare,
    receive: receive
  })

  if (schema) schema.validate(data)

  return data
}
