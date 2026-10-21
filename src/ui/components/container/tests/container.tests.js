/* eslint-env mocha */
/* global $ */
import { expect } from 'chai'
import { createRendererTestContext } from '../../../../tests/helpers/rendererHelpers.tests'
import '../container'
import { asyncTimeout } from '../../../../utils/asyncTimeout'

describe('container', () => {
  const { setup, render, teardown } = createRendererTestContext()
  beforeEach(() => {
    setup()
  })

  afterEach(() => {
    teardown()
  })

  it('is initially not displayed after being rendered', async function () {
    this.timeout(3000)

    const root = await render('container', {})
    const container = $(root.firstChild)

    expect(container.hasClass('lea-base-container')).to.equal(true)
    expect(container.data('visible')).to.equal(false)

    await asyncTimeout(1500)

    expect(container.hasClass('lea-base-container')).to.equal(true)
    expect(container.data('visible')).to.equal(true)
  })
})
