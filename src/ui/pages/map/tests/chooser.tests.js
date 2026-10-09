import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import { createRendererTestContext } from '../../../../tests/helpers/rendererHelpers.tests'
import { buildMapModel } from '../model'
import { inputs } from './model.tests'
import '../mapStageChooser'

describe('learner map chooser', function () {
  const context = createRendererTestContext()
  beforeEach(() => context.setup())
  afterEach(() => context.teardown())
  const options = overrides => ({
    stage: buildMapModel(inputs).stages[0], onSelect: () => {}, onClose: () => {}, onDecision: () => {}, ...overrides
  })
  it('opens without selecting a UnitSet and calls back only on explicit selection', async function () {
    const selected = []
    const host = await context.render('mapStageChooser', options({ onSelect: id => selected.push(id) }))
    expect(selected).to.deep.equal([])
    expect(host.querySelector('.modal').getAttribute('aria-modal')).to.equal('true')
    expect(host.contains(document.activeElement)).to.equal(true)
    host.querySelector('.map-unitset').click()
    expect(selected).to.deep.equal(['a'])
  })
  it('disables choices while busy or offline and presents decisions within the same modal', async function () {
    const decisions = []
    const data = new ReactiveVar(options({ busy: true, onDecision: value => decisions.push(value) }))
    const host = await context.render('mapStageChooser', () => data.get())
    expect([...host.querySelectorAll('.map-unitset')].every(button => button.disabled)).to.equal(true)
    data.set({ ...data.get(), busy: false, offline: true })
    await context.afterFlush()
    expect([...host.querySelectorAll('.map-unitset')].every(button => button.disabled)).to.equal(true)
    data.set({ ...data.get(), offline: false, deciding: true })
    await context.afterFlush()
    host.querySelector('[data-decision="continue"]').click()
    expect(decisions).to.deep.equal(['continue'])
    expect(host.querySelectorAll('.modal')).to.have.length(1)
  })
  it('closes with Escape and cleans up its backdrop on removal', async function () {
    let closed = 0
    const before = document.querySelectorAll('.modal-backdrop').length
    const host = await context.render('mapStageChooser', options({ onClose: () => closed++ }))
    host.querySelector('.modal').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(closed).to.equal(1)
    context.teardown()
    expect(document.querySelectorAll('.modal-backdrop').length).to.equal(before)
    expect(document.body.classList.contains('modal-open')).to.equal(false)
  })
})
