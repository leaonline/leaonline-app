/* eslint-env mocha */
import { expect } from 'chai'
import {asyncTimeout } from '../asyncTimeout'
const { performance } = require('node:perf_hooks');
describe(asyncTimeout.name, function () {
  it('creates a promise that resolves after timeout', async () => {
    const start = performance.now()
    await asyncTimeout(150)
    const end = performance.now()
    const val = Math.round(end - start)
    expect(val).to.be.greaterThanOrEqual(150)
  })
})
