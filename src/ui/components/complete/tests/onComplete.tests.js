/* eslint-env mocha */
/* global $ */
import { expect } from 'chai'
import {
  createRendererTestContext,
  waitFor,
} from '../../../../tests/helpers/rendererHelpers.tests'
import '../onComplete'

describe('onComplete', () => {
  const { setup, teardown, render } = createRendererTestContext()
  beforeEach(() => {
    setup()
  })

  afterEach(() => {
    teardown()
  })

  it('renders a loading icon by default', async () => {
    const el = await render('onComplete', {})
    await waitFor(() => el.querySelector('h1'))
    const root = el.querySelector('h1')
    expect(root.className).to.include('loading-header')
  })

  it('renders a content block when load complete', async () => {
    const el = await render('onComplete', {
      complete: true,
    })
    expect($(el).children().length).to.equal(0)
  })
})
