import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Tracker } from 'meteor/tracker'
import 'meteor/leaonline:ui/components/icon/icon'
import { translate } from '../../../api/i18n/translate'
import { layoutMap } from './model'
import './learnerMap.html'
import './map.css'

let nextScope = 0
export const stageDescription = entry => {
  const percentage = metric => metric.percent === null ? translate('map.unavailable') : `${Math.round(metric.percent)}%`
  return [
    translate('map.entry.title', { value: entry.number }),
    entry.complete && translate('map.completed'),
    `${translate('map.pages')}: ${percentage(entry.progress)}`,
    ...entry.choices.map(c => `${c.dimension.title}: ${translate('map.competencies')} ${c.competencies.current ?? '–'} / ${c.competencies.max ?? '–'} (${percentage(c.competencies)})`)
  ].filter(Boolean).join('. ')
}

Template.learnerMap.onCreated(function () {
  this.scope = `learner-map-${++nextScope}`
  this.width = new ReactiveVar(320)
  this.scene = new ReactiveVar(null)
  this.autorun(() => {
    const data = Template.currentData()
    try {
      this.scene.set(layoutMap(data.model, this.width.get()))
    }
    catch (error) {
      Tracker.nonreactive(() => data.onError?.(error))
    }
  })
})
Template.learnerMap.onRendered(function () {
  const root = this.find('.learner-map-scene')
  const measure = () => {
    if (this.view.isDestroyed) return
    try {
      const width = root.getBoundingClientRect().width
      if (width > 0) this.width.set(width)
    }
    catch (error) {
      this.data.onError?.(error)
    }
  }
  try {
    measure()
    this.observer = new window.ResizeObserver(measure)
    this.observer.observe(root)
    Tracker.afterFlush(() => {
      if (this.view.isDestroyed) return
      const data = this.data
      const target = this.findAll('.map-stage').find(el => el.dataset.stage === data.currentId)
      try {
        target?.scrollIntoView({ block: 'center', behavior: 'instant' })
      }
      catch (error) {
        this.data.onError?.(error)
      }
    })
  }
  catch (error) {
    this.data.onError?.(error)
  }
})
Template.learnerMap.onDestroyed(function () { this.observer?.disconnect() })
Template.learnerMap.helpers({
  scope: () => Template.instance().scope,
  scene: () => Template.instance().scene.get(),
  isMilestone: entry => entry.type === 'milestone',
  isFinish: entry => entry.type === 'finish',
  decorations () {
    const instance = Template.instance()
    const scene = instance.scene.get()
    if (!scene) return []
    const icons = Template.currentData().model.icons
    return scene.entries.filter(e => e.isStage).map((e, i) => ({ x: scene.width / 2, y: e.y - 75, icon: icons[i % icons.length] }))
  }
})
Template.learnerMap.events({
  'click .map-stage' (event, instance) { instance.data.onSelect(event.currentTarget.dataset.stage) },
  'keydown .map-stage' (event, instance) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      instance.data.onSelect(event.currentTarget.dataset.stage)
      return
    }
    const stages = instance.findAll('.map-stage')
    const index = stages.indexOf(event.currentTarget)
    const offset = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key]
    const destination = event.key === 'Home' ? 0 : event.key === 'End' ? stages.length - 1 : offset === undefined ? null : Math.max(0, Math.min(stages.length - 1, index + offset))
    if (destination !== null) { event.preventDefault(); stages[destination].focus() }
  }
})
Template.mapStage.helpers({
  stageClass () { return [this.currentId === this.entry.id ? 'bg-primary is-current' : this.entry.complete ? 'bg-success' : '', this.entry.complete ? 'is-complete' : '', this.selectedId === this.entry.id ? 'is-selected' : ''].join(' ') },
  current () { return this.currentId === this.entry.id ? 'step' : false },
  selected () { return this.selectedId === this.entry.id ? 'true' : 'false' },
  description () { return stageDescription(this.entry) },
  ring () { return this.entry.complete ? 100 : this.entry.progress.percent ?? 0 },
  clipId (choice) { return `${Template.currentData().scope}-${Template.currentData().entry.id}-${choice.slot}` },
  fillY: choice => 11 - 22 * choice.diamondFill,
  fillHeight: choice => 22 * choice.diamondFill
})
Template.mapMilestone.helpers({
  stars () { return Array.from({ length: this.entry.level.number }, (_, i) => ({ x: (i - (this.entry.level.number - 1) / 2) * 11 })) }
})
