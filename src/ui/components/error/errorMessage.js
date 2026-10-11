import './errorMessage.html'
import { errorToObject } from '../../../utils/object/errorToObject'

Template.errorMessage.onCreated(function () {
  this.autorun(() => {
    const data = Template.currentData()
    const error = data.error ? errorToObject(data.error) : null
    this.state.set({ error })
  })
})

Template.errorMessage.helpers({
  parsedError() {
    return Template.getState('error')
  },
})
