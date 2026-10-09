import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { i18n } from '../../../../api/i18n/I18n'
import { createRendererTestContext } from '../../../../tests/helpers/rendererHelpers.tests'
import { buildMapModel } from '../model'
import { inputs } from './model.tests'
import '../learnerMap'

describe('learner map Blaze scene', function () {
  const context = createRendererTestContext()
  beforeEach(() => {
    context.setup()
    context.sandbox.stub(i18n, 'get').callsFake(key => `translated:${key}`)
  })
  afterEach(() => context.teardown())
  it('renders selectable stages, fixed diamonds, milestones and separate finish', async function () {
    const model = buildMapModel(inputs)
    const host = await context.render('learnerMap', { model, currentId: model.anchorId, onSelect: () => {} })
    expect(host.querySelectorAll('[role="button"]')).to.have.length(3)
    expect(host.querySelectorAll('.map-diamond')).to.have.length(4)
    expect(host.querySelectorAll('.map-milestone')).to.have.length(1)
    expect(host.querySelectorAll('.map-finish')).to.have.length(1)
    expect(host.querySelector('.map-stage').getAttribute('aria-label')).to.include('translated:map.entry.title')
  })
  it('activates with Enter/Space and moves focus in logical journey order', async function () {
    const selected = []
    const host = await context.render('learnerMap', { model: buildMapModel(inputs), onSelect: id => selected.push(id) })
    const stages = host.querySelectorAll('.map-stage')
    stages[0].focus()
    stages[0].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(document.activeElement).to.equal(stages[1])
    stages[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    stages[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(selected).to.deep.equal([stages[1].dataset.stage, stages[1].dataset.stage])
  })
  it('retains stage nodes and focus through learner updates', async function () {
    const data = new ReactiveVar({ model: buildMapModel(inputs), onSelect: () => {} })
    const host = await context.render('learnerMap', () => data.get())
    const stage = host.querySelector('.map-stage')
    stage.focus()
    data.set({ ...data.get(), currentId: data.get().model.stages[1].id })
    await context.afterFlush()
    expect(document.activeElement).to.equal(stage)
  })
  it('scopes clip paths to each mounted instance', async function () {
    const data = { model: buildMapModel(inputs), onSelect: () => {} }
    const host = await context.render('learnerMap', data)
    const second = document.createElement('div')
    document.body.appendChild(second)
    const view = Blaze.renderWithData(Template.learnerMap, data, second)
    try {
      await context.afterFlush()
      const ids = [...host.querySelectorAll('clipPath'), ...second.querySelectorAll('clipPath')].map(el => el.id)
      expect(new Set(ids).size).to.equal(ids.length)
    }
    finally {
      Blaze.remove(view)
      second.remove()
    }
  })
  it('keeps completion, current stage and selection independent', async function () {
    const model = buildMapModel({ ...inputs, progress: { unitSets: ['a', 'b'].map(_id => ({ _id, complete: true, progress: 4, competencies: 1 })) } })
    const data = new ReactiveVar({ model, currentId: model.stages[0].id, selectedId: model.stages[0].id, onSelect: () => {} })
    const host = await context.render('learnerMap', () => data.get())
    const stage = host.querySelector('.map-stage')
    expect(stage.classList.contains('bg-primary')).to.equal(true)
    expect(stage.classList.contains('is-complete')).to.equal(true)
    expect(stage.getAttribute('aria-label')).to.include('translated:map.completed')
    expect(stage.querySelector('.map-stage-ring').getAttribute('stroke-dasharray')).to.equal('100 100')
    data.set({ ...data.get(), selectedId: null })
    await context.afterFlush()
    expect(stage.classList.contains('is-selected')).to.equal(false)
    expect(stage.classList.contains('is-current')).to.equal(true)
  })
  it('resizes without replacing focused stages and disconnects its observer', async function () {
    let notify
    let disconnected = false
    context.sandbox.stub(window, 'ResizeObserver').callsFake(function (callback) {
      notify = callback
      this.observe = () => {}
      this.disconnect = () => { disconnected = true }
    })
    const model = buildMapModel(inputs)
    const host = await context.render('learnerMap', { model, onSelect: () => {} })
    const stage = host.querySelector('.map-stage')
    const root = host.querySelector('.learner-map-scene')
    context.sandbox.stub(root, 'getBoundingClientRect').returns({ width: 1200 })
    stage.focus()
    notify()
    await context.afterFlush()
    expect(host.querySelector('svg').getAttribute('viewBox')).to.match(/^0 0 1200 /)
    expect(document.activeElement).to.equal(stage)
    context.teardown()
    expect(disconnected).to.equal(true)
  })
  it('reports scene setup failure for the list fallback', async function () {
    let failure
    context.sandbox.stub(window, 'ResizeObserver').throws(new Error('renderer failed'))
    await context.render('learnerMap', { model: buildMapModel(inputs), onError: error => { failure = error } })
    expect(failure.message).to.equal('renderer failed')
  })
})
