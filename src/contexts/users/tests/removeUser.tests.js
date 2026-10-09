/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { removeUser } from '../removeUser'
import { Session } from '../../session/Session'
import { Progress } from '../../progress/Progress'
import { Response } from '../../response/Response'
import { getUsersCollection } from '../../../api/collections/getUsersCollection'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'
import { expectThrown } from '../../../tests/helpers/expectThrown'
import { forEachAsync } from '../../../infrastructure/async/forEachAsync'

const UsersCollection = getUsersCollection()
const SessionCollection = initTestCollection(Session)
const ProgressCollection = initTestCollection(Progress)
const ResponseCollection = initTestCollection(Response)
const allCollections = [UsersCollection, SessionCollection, ProgressCollection, ResponseCollection]

describe(removeUser.name, function () {
  setupAndTeardown(allCollections)

  it('throws if the user is not defined', async () => {
    const calledBy = Random.id()
    const allIds = [undefined, null, Random.id()]
    await forEachAsync(allIds, async userId => {
      await expectThrown({
        fn: () => removeUser(userId, calledBy),
        name: 'removeUser.error',
        reason: 'removeUser.userDoesNotExist',
        details: { userId, calledBy }
      })
    })
  })
  it('removes all the user\'s data', async () => {
    const userId = await UsersCollection.insertAsync({ username: Random.id() })
    await ResponseCollection.insertAsync({ userId })
    await SessionCollection.insertAsync({ userId })
    await ProgressCollection.insertAsync({ userId })
    const result = await removeUser(userId, userId)
    expect(result).to.deep.equal({
      responsesRemoved: 1,
      sessionsRemoved: 1,
      progressRemoved: 1,
      userRemoved: 1
    })
  })
})
