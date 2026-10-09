import './switch.html'

Template.switch.onCreated(function () {
  const dataAtts = {}
  Object.entries(this.data).forEach(([key, value]) => {
    if (key.includes('data-')) {
      dataAtts[key] = value
    }
  })
  this.state.set({ dataAtts })
})

Template.switch.helpers({
  inputAtts() {
    return Template.getState('dataAtts')
  },
})

Template.switch.onRendered(function () {
  // set initial checked value
  const isChecked = !!this.data.value
  const $input = this.$('input')
  $input.get(0).checked = isChecked
})
