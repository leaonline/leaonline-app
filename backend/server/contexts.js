import { Users } from '../contexts/Users'
import { Content } from '../contexts/Content'
import { createMethod } from '../infrastructure/factories/createMethod'

[Users, Content].forEach(context => {
  const methods = Object.values(context.methods)
  methods.forEach(method => createMethod(method))
})