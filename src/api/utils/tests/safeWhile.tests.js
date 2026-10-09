/* eslint-env mocha */
import { expect } from 'chai'
import { safeWhile } from '../safeWhile'

describe(safeWhile.name, () => {
  it('cancels on non-undefined falsey', () => {
    let count = 0
    safeWhile(() => count++)
    expect(count).to.equal(1)
  })
  it('safely skips', () => {
    let count = 0
    safeWhile(() => {
      count++
    })
    expect(count).to.equal(51)
  })
})
