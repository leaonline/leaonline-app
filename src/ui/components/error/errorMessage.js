import './errorMessage.html'
import {errorToObject} from "../../../utils/object/errorToObject";

Template.errorMessage.onCreated(function () {
    const instance = this
    instance.autorun(() => {
        const data = Template.currentData()
        const error = data.error ? errorToObject(data.error) : null
        instance.state.set({ error })
    })
})

Template.errorMessage.helpers({
    parsedError () {
        return Template.getState('error')
    }
})