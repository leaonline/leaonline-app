/* eslint-env mocha */
/* global $ */
import { expect } from 'chai'
import { UITests } from '../../../../../tests/ui-helpers.tests'
import '../onComplete'

describe('onComplete', function () {
  beforeEach(function () {
    UITests.preRender()
  })

  afterEach(function () {
    UITests.postRender()
  })

  it('renders a loading icon by default', async function () {
    const el = await UITests.withRenderedTemplate('onComplete', {})
    expect($(el).children().get(0).className).to.include('loading-header')
  })

  it('renders a content block when load complete', async function () {
    const el = await UITests.withRenderedTemplate('onComplete', { complete: true })
    expect($(el).children().length).to.equal(0)
  })
})
