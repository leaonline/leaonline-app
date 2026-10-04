import './switch.html'

Template.switch.onCreated(function () {
  const instance = this
  const dataAtts = {}
  Object.entries(instance.data).forEach(([key, value]) => {
    if (key.includes('data-')) {
      dataAtts[key] = value
    }
  })
  instance.state.set({ dataAtts })
})

Template.switch.helpers({
  inputAtts () {
    return Template.getState('dataAtts')
  }
})

Template.switch.onRendered(function () {
  // set initial checked value
  const isChecked = !!this.data.value
  const $input = this.$('input')
  $input.get(0).checked = isChecked
})
