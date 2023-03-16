export const Connect = {}

Connect.name = 'connect'
Connect.label = 'item.connect.title'
Connect.icon = 'tasks'
Connect.isItem = true

Connect.subtypes = {
  default: 'default'
}

Connect.getSubtype = () => Connect.subtypes.default
