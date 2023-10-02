import { Achievements } from '../../lib/contexts/Achievements'

describe(Achievements.name, function () {
  describe(Achievements.collection.name, () => {
    it('throws if collection is not initiated', () => {
      expect(() => Achievements.collection())
        .toThrow(`Collection ${Achievements.name} not initialized`)
    })
  })
  describe(Achievements.init.name, function () {
    test.todo('loads sync docs into collection')
  })
})
