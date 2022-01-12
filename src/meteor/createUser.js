import Meteor from '@meteorrn/core'

export const createUser = () => {
  console.debug('call meteor', Meteor.status())
  Meteor.call('test', (err, res) => {
    if (err) {
      console.error(err)
    }
    console.debug({ res })
  })
}
