export const Choice = {}

Choice.name = 'choice'
Choice.label = 'item.choice.title'
Choice.icon = 'list'
Choice.isItem = true

Choice.flavors = {
  single: {
    name: 'single',
    value: 1,
    label: 'item.choice.single'
  },
  multiple: {
    name: 'multiple',
    value: 2,
    label: 'item.choice.multiple'
  }
}

Choice.subtypes = {
  choiceText: 'choiceText',
  choiceImage: 'choiceImage'
}

Choice.getSubtype = value => {
  const hasImage = value.choices.some(c => !!c.image)
  return hasImage
    ? 'choiceImage'
    : 'choiceText'
}
