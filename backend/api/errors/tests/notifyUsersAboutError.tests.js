/* eslint-env mocha */
import { expect } from 'chai'
import { notifyUsersAboutError } from '../notifyUsersAboutError'

describe(notifyUsersAboutError.name, function () {
  it('notifies registered users about an error', () => {
    expect.fail()
  })
})
