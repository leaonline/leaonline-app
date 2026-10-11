import { expect } from 'chai'
import { ReactiveVar } from 'meteor/reactive-var'
import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { i18n } from '../../../../api/i18n/I18n'
import { createRendererTestContext } from '../../../../tests/helpers/rendererHelpers.tests'
import { buildMapModel } from '../model'
import { inputs } from './model.tests'
import '../learnerMap'

describe('learner map Blaze scene', () => {
  const context = createRendererTestContext()
  beforeEach(() => {
    context.setup()
    context.sandbox.stub(i18n, 'get').callsFake((key) => `translated:${key}`)
  })
  afterEach(() => context.teardown())
  it('renders selectable stages, fixed diamonds, milestones and separate finish', async () => {
    const model = buildMapModel(inputs)
    const host = await context.render('learnerMap', {
      model,
      currentId: model.anchorId,
      onSelect: () => {},
    })
    expect(host.querySelectorAll('[role="button"]')).to.have.length(3)
    expect(host.querySelectorAll('.map-diamond')).to.have.length(4)
    expect(host.querySelectorAll('.map-milestone')).to.have.length(1)
    expect(host.querySelectorAll('.map-finish')).to.have.length(1)
    expect(
      host.querySelector('.map-stage').getAttribute('aria-label'),
    ).to.include('translated:map.entry.title')
  })
  it('activates with Enter/Space and moves focus in logical journey order', async () => {
    const selected = []
    const host = await context.render('learnerMap', {
      model: buildMapModel(inputs),
      onSelect: (id) => selected.push(id),
    })
    const stages = host.querySelectorAll('.map-stage')
    stages[0].focus()
    stages[0].dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    )
    expect(document.activeElement).to.equal(stages[1])
    stages[1].dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    )
    stages[1].dispatchEvent(
      new window.KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    )
    expect(selected).to.deep.equal([
      stages[1].dataset.stage,
      stages[1].dataset.stage,
    ])
  })
  it('supports arrow boundaries, Home/End and click without changing tab order', async () => {
    const selected = []
    const model = buildMapModel(inputs)
    const host = await context.render('learnerMap', {
      model,
      onSelect: (id) => selected.push(id),
    })
    const stages = [...host.querySelectorAll('.map-stage')]
    expect(stages.map((stage) => stage.dataset.stage)).to.deep.equal(
      model.stages.map((stage) => stage.id),
    )
    expect(
      stages.every((stage) => stage.getAttribute('tabindex') === '0'),
    ).to.equal(true)
    stages[0].focus()
    for (const [key, destination] of [
      ['ArrowUp', 0],
      ['ArrowLeft', 0],
      ['ArrowRight', 1],
      ['ArrowDown', 2],
      ['ArrowDown', 2],
      ['ArrowRight', 2],
      ['ArrowUp', 1],
      ['End', 2],
      ['Home', 0],
    ]) {
      document.activeElement.dispatchEvent(
        new window.KeyboardEvent('keydown', { key, bubbles: true }),
      )
      expect(document.activeElement).to.equal(stages[destination])
    }
    stages[2].dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(selected).to.deep.equal([model.stages[2].id])
  })
  it('centers the supplied anchor and exposes unavailable progress', async () => {
    const scroll = context.sandbox.stub(
      window.Element.prototype,
      'scrollIntoView',
    )
    const model = buildMapModel({ ...inputs, progressAvailable: false })
    const host = await context.render('learnerMap', {
      model,
      currentId: model.stages[1].id,
      onSelect: () => {},
    })
    expect(scroll.calledOnce).to.equal(true)
    expect(scroll.firstCall.thisValue).to.equal(
      host.querySelectorAll('.map-stage')[1],
    )
    expect(scroll.firstCall.args).to.deep.equal([
      { block: 'center', behavior: 'instant' },
    ])
    expect(
      host.querySelector('.map-stage').getAttribute('aria-label'),
    ).to.include('translated:map.unavailable')
  })
  it('retains stage nodes and focus through learner updates', async () => {
    const data = new ReactiveVar({
      model: buildMapModel(inputs),
      onSelect: () => {},
    })
    const host = await context.render('learnerMap', () => data.get())
    const stage = host.querySelector('.map-stage')
    stage.focus()
    data.set({ ...data.get(), currentId: data.get().model.stages[1].id })
    await context.afterFlush()
    expect(document.activeElement).to.equal(stage)
  })
  it('scopes clip paths to each mounted instance', async () => {
    const data = { model: buildMapModel(inputs), onSelect: () => {} }
    const host = await context.render('learnerMap', data)
    const second = document.createElement('div')
    document.body.appendChild(second)
    const view = Blaze.renderWithData(Template.learnerMap, data, second)
    try {
      await context.afterFlush()
      const ids = [
        ...host.querySelectorAll('clipPath'),
        ...second.querySelectorAll('clipPath'),
      ].map((el) => el.id)
      expect(new Set(ids).size).to.equal(ids.length)
    } finally {
      Blaze.remove(view)
      second.remove()
    }
  })
  it('keeps completion, current stage and selection independent', async () => {
    const model = buildMapModel({
      ...inputs,
      progress: {
        unitSets: ['a', 'b'].map((_id) => ({
          _id,
          complete: true,
          progress: 4,
          competencies: 1,
        })),
      },
    })
    const data = new ReactiveVar({
      model,
      currentId: model.stages[0].id,
      selectedId: model.stages[0].id,
      onSelect: () => {},
    })
    const host = await context.render('learnerMap', () => data.get())
    const stage = host.querySelector('.map-stage')
    expect(stage.classList.contains('bg-primary')).to.equal(true)
    expect(stage.classList.contains('is-complete')).to.equal(true)
    expect(stage.getAttribute('aria-label')).to.include(
      'translated:map.completed',
    )
    expect(
      stage.querySelector('.map-stage-ring').getAttribute('stroke-dasharray'),
    ).to.equal('100 100')
    data.set({ ...data.get(), selectedId: null })
    await context.afterFlush()
    expect(stage.classList.contains('is-selected')).to.equal(false)
    expect(stage.classList.contains('is-current')).to.equal(true)
  })
  it('resizes without replacing focused stages and disconnects its observer', async () => {
    let notify
    let disconnected = false
    context.sandbox
      .stub(window, 'ResizeObserver')
      .callsFake(function (callback) {
        notify = callback
        this.observe = () => {}
        this.disconnect = () => {
          disconnected = true
        }
      })
    const model = buildMapModel(inputs)
    const host = await context.render('learnerMap', {
      model,
      onSelect: () => {},
    })
    const stage = host.querySelector('.map-stage')
    const root = host.querySelector('.learner-map-scene')
    context.sandbox.stub(root, 'getBoundingClientRect').returns({ width: 1200 })
    stage.focus()
    notify()
    await context.afterFlush()
    expect(host.querySelector('svg').getAttribute('viewBox')).to.match(
      /^0 0 1200 /,
    )
    expect(document.activeElement).to.equal(stage)
    context.teardown()
    expect(disconnected).to.equal(true)
  })
  it('reports scene setup failure for the list fallback', async () => {
    let failure
    context.sandbox
      .stub(window, 'ResizeObserver')
      .throws(new Error('renderer failed'))
    await context.render('learnerMap', {
      model: buildMapModel(inputs),
      onError: (error) => {
        failure = error
      },
    })
    expect(failure.message).to.equal('renderer failed')
  })
})
