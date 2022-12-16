import { createRepository } from '../../infrastructure/createRepository'
import { simpleRandom } from '../../__testHelpers__/simpleRandom'

describe(createRepository.name, function () {
  it('creates a repository-pattern impl', () => {
    const repo = createRepository()
    const name = simpleRandom()
    const value = simpleRandom()

    expect(repo.has(name)).toEqual(false)
    repo.add(name, value)
    expect(repo.has(name)).toEqual(true)
    expect(repo.get(name)).toEqual(value)
    expect(() => repo.add(name, value))
      .toThrow(`Entry "${name}" already exists`)
  })
})
