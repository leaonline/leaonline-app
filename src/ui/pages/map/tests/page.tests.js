import { expect } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Blaze } from 'meteor/blaze'
import { ReactiveVar } from 'meteor/reactive-var'
import { Router } from '../../../routing/Router'
import { Session } from '../../../../contexts/session/Session'
import { Field } from '../../../../contexts/content/Field'
import { MapData } from '../../../../contexts/map/MapData'
import { Dimension } from '../../../../contexts/content/Dimension'
import { Progress } from '../../../../contexts/progress/Progress'
import * as contentLoader from '../../../loading/loadContentDoc'
import * as referenceLoader from '../../../loading/loadAllContentDocs'
import * as collections from '../../../../api/utils/getLocalCollection'
import * as methods from '../../../../infrastructure/methods/callMethod'
import * as icons from '../data'
import { createRendererTestContext, waitFor } from '../../../../tests/helpers/rendererHelpers.tests'
import { inputs } from './model.tests'
import '../../../templates/initDependencies'
import '../map'

const deferred = () => {
  let release
  const promise = new Promise(resolve => { release = resolve })
  return { promise, resolve: release }
}

// Real initDependencies still initializes contexts, language, translations and
// template APIs. Gate only its completion callback to exercise page readiness.
// These tests require the application's configured client test environment.
describe('learner map page', function () {
  const context = createRendererTestContext()
  let instance
  let dependencies
  let user
  let field
  let query
  let connected
  let load
  let calls
  let start
  let selected
  let pending
  let accountSequence = 0

  beforeEach(() => {
    context.setup()
    instance = null
    dependencies = null
    pending = []
    user = new ReactiveVar(`map-test-user-${++accountSequence}`)
    field = new ReactiveVar('field')
    query = new ReactiveVar({})
    connected = true
    selected = context.sandbox.spy()
    context.sandbox.stub(Meteor, 'userId').callsFake(() => user.get())
    context.sandbox.stub(Meteor, 'status').callsFake(() => ({ connected }))
    context.sandbox.stub(Router, 'param').callsFake(() => field.get())
    context.sandbox.stub(Router, 'current').callsFake(() => ({ queryParams: query.get() }))
    context.sandbox.stub(Router, 'queryParam').callsFake(value => {
      if (typeof value === 'string') return query.get()[value]
      query.set({ ...query.get(), ...value })
    })
    context.sandbox.stub(Router.src, 'withReplaceState').callsFake(callback => callback())
    context.sandbox.stub(Session, 'data').returns(null)
    start = context.sandbox.stub(Session, 'start')
    calls = context.sandbox.stub(methods, 'callMethod').resolves({
      sessionDoc: { _id: 'session', userId: user.get(), fieldId: 'field', unitSet: 'a', unit: 'first' },
      unitSetDoc: { _id: 'a', field: 'field', units: ['first'] }
    })
    context.sandbox.stub(icons, 'loadMapIcons').resolves(['book'])
    context.sandbox.stub(referenceLoader, 'loadAllContentDocs').resolves()
    context.sandbox.stub(collections, 'getLocalCollection').callsFake(name => ({
      findOne: id => {
        const doc = (name === Dimension.name ? inputs.dimensions : inputs.levels).find(doc => doc._id === id)
        return doc && { ...doc, colorType: 0 }
      }
    }))
    load = context.sandbox.stub(contentLoader, 'loadContentDoc').callsFake(async ({ context: source }) => {
      if (source === Field) return { _id: field.get(), title: 'Test field' }
      if (source === MapData) return { ...inputs.topology, field: field.get() }
      if (source === Progress) return null
    })
    const initialize = Blaze.TemplateInstance.prototype.initDependencies
    context.sandbox.stub(Blaze.TemplateInstance.prototype, 'initDependencies').callsFake(function (options) {
      if (this.view.name !== 'Template.map') return initialize.call(this, options)
      instance = this
      return initialize.call(this, { ...options, onComplete: () => { dependencies = options.onComplete } })
    })
  })
  afterEach(async () => {
    context.teardown()
    pending.forEach(item => item.resolve(null))
    await Promise.all(pending.map(item => item.promise))
    await context.afterFlush()
  })
  const render = async () => {
    const host = await context.render('map', { onSelected: selected })
    await waitFor(() => dependencies, 'real map dependencies')
    return host
  }
  const ready = async () => {
    const host = await render()
    dependencies()
    await waitFor(() => instance.state.get('ready'), 'map load')
    await context.afterFlush()
    return host
  }
  const choose = async host => {
    host.querySelector('.map-list-stage, .map-stage').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    await context.afterFlush()
  }

  it('waits for dependencies and loads without mutating a Session', async () => {
    await render()
    expect(load.called).to.equal(false)
    dependencies()
    await waitFor(() => instance.state.get('ready'), 'map load')
    expect(instance.state.get('model').stages).to.have.length(3)
    expect(calls.called).to.equal(false)
    expect(start.called).to.equal(false)
  })
  it('preserves selection across view toggles and restores focus on dismissal', async () => {
    const host = await ready()
    await choose(host)
    const id = instance.state.get('selectedId')
    expect(id).to.equal(instance.state.get('model').stages[0].id)
    expect(calls.called).to.equal(false)
    for (const mode of ['list', 'map']) {
      host.querySelector(`[data-mode="${mode}"]`).click()
      await context.afterFlush()
      expect(instance.state.get('selectedId')).to.equal(id)
    }
    host.querySelector('.map-chooser-close').click()
    await context.afterFlush()
    expect(document.activeElement.dataset.stage).to.equal(id)
  })
  for (const failure of ['icons', 'metadata', 'renderer']) {
    it(`retains selectable list entries after ${failure} failure`, async () => {
      if (failure === 'icons') icons.loadMapIcons.rejects(new Error('icons failed'))
      if (failure === 'metadata') collections.getLocalCollection.returns({ findOne: () => null })
      if (failure === 'renderer') context.sandbox.stub(window, 'ResizeObserver').throws(new Error('renderer failed'))
      const host = await ready()
      expect(host.querySelectorAll('.map-list-stage')).to.have.length(3)
      await choose(host)
      expect(host.querySelectorAll('.map-unitset')).to.have.length(2)
      expect(calls.called).to.equal(false)
    })
  }
  for (const progress of ['missing', 'failed', 'wrong account']) {
    it(`distinguishes ${progress} progress`, async () => {
      load.callsFake(async ({ context: source }) => {
        if (source === Field) return { _id: 'field', title: 'Test field' }
        if (source === MapData) return inputs.topology
        if (source === Progress) {
          if (progress === 'failed') throw new Error('progress failed')
          return progress === 'missing' ? null : { userId: 'other', fieldId: 'field' }
        }
      })
      await ready()
      expect(instance.state.get('learnerUnavailable')).to.equal(progress !== 'missing')
    })
  }
  it('recovers from invalid topology on explicit retry', async () => {
    load.onSecondCall().resolves(null)
    const host = await ready()
    expect(instance.state.get('loadError')).to.equal('map.invalidTopology')
    host.querySelector('.map-retry').click()
    await waitFor(() => instance.state.get('model'), 'retry model')
    expect(instance.state.get('loadError')).to.equal(null)
  })
  it('reflects UnitSet URL hints and Back/Forward without Session requests', async () => {
    query.set({ unitSet: 'c' })
    await ready()
    const id = instance.state.get('model').stages[1].id
    expect(instance.state.get('selectedId')).to.equal(id)
    query.set({})
    await context.afterFlush()
    expect(instance.state.get('selectedId')).to.equal(null)
    query.set({ stage: id })
    await context.afterFlush()
    expect(instance.state.get('selectedId')).to.equal(id)
    expect(calls.called).to.equal(false)
  })
  it('starts only on explicit UnitSet selection and navigates once', async () => {
    const host = await ready()
    await choose(host)
    const button = host.querySelector('.map-unitset')
    button.click()
    button.click()
    await waitFor(() => selected.called, 'selected Session')
    expect(calls.calledOnce).to.equal(true)
    expect(start.calledOnce).to.equal(true)
    expect(selected.calledOnce).to.equal(true)
  })
  it('blocks offline selection and allows retry after a Session error', async () => {
    connected = false
    const host = await ready()
    await choose(host)
    const button = host.querySelector('.map-unitset')
    expect(button.disabled).to.equal(true)
    button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(calls.called).to.equal(false)
    connected = true
    host.querySelector('.map-chooser-close').click()
    await context.afterFlush()
    await choose(host)
    const onlineButton = host.querySelector('.map-unitset')
    calls.onFirstCall().rejects(new Error('session failed'))
    onlineButton.click()
    await waitFor(() => instance.state.get('sessionError'), 'Session error')
    expect(instance.state.get('busy')).to.equal(false)
    await context.afterFlush()
    host.querySelector('.map-unitset').click()
    await waitFor(() => selected.called, 'Session retry')
    expect(start.calledOnce).to.equal(true)
  })
  for (const boundary of ['retry', 'account', 'field', 'destroy']) {
    it(`prevents stale load installation after ${boundary}`, async () => {
      const request = deferred()
      pending.push(request)
      load.onFirstCall().returns(request.promise)
      await render()
      dependencies()
      expect(load.calledOnce).to.equal(true)
      const staleInstance = instance
      if (boundary === 'retry') {
        // Exercise the registered retry event while the first load is pending.
        instance.state.set('loadError', 'map.invalidTopology')
        await context.afterFlush()
        instance.find('.map-retry').click()
      }
      if (boundary === 'account') user.set('other')
      if (boundary === 'field') field.set('other')
      if (boundary === 'destroy') context.teardown()
      if (boundary !== 'destroy') await waitFor(() => instance.state.get('ready'), 'new load')
      const model = staleInstance.state.get('model')
      request.resolve({ _id: 'field', title: 'Stale field' })
      await request.promise
      await context.afterFlush()
      expect(staleInstance.state.get('model')).to.equal(model)
      expect(staleInstance.state.get('field')?.title).not.to.equal('Stale field')
    })
  }
  for (const boundary of ['close', 'account', 'field', 'destroy']) {
    it(`discards a pending Session after ${boundary}`, async () => {
      const request = deferred()
      pending.push(request)
      calls.returns(request.promise)
      const host = await ready()
      await choose(host)
      host.querySelector('.map-unitset').click()
      expect(calls.calledOnce).to.equal(true)
      if (boundary === 'close') host.querySelector('.map-chooser-close').click()
      if (boundary === 'account') user.set('other')
      if (boundary === 'field') field.set('other')
      if (boundary === 'destroy') context.teardown()
      await context.afterFlush()
      request.resolve(null)
      await request.promise
      await context.afterFlush()
      expect(start.called).to.equal(false)
      expect(selected.called).to.equal(false)
    })
  }
})
