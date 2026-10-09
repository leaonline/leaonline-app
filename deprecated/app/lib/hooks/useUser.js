import Meteor from '@meteorrn/core'
import { useState } from 'react'

export const useUser = () => {
  const [user, setUser] = useState()

  Meteor.useTracker(computation => {
    const current = Meteor.user()
    if (user !== current) setUser(current)
  })

  return { user }
}
