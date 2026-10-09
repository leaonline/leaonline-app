// Pure presentation adapter. No collection reads, translation, learner cache or
// mutation of the backend's canonical topology belongs here.
export const percentage = (current, max) => Number.isFinite(current) && Number.isFinite(max) && max > 0
  ? Math.max(0, Math.min(100, 100 * current / max))
  : null

export const diamondFraction = fraction => {
  if (!Number.isFinite(fraction) || fraction <= 0) return 0
  if (fraction < 0.3) return 0.3
  if (fraction > 0.75 && fraction < 0.9) return 0.75
  return fraction >= 0.9 ? 1 : fraction
}

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}
const metric = (current, max, available) => ({
  current: available && Number.isFinite(current) ? current : null,
  max: Number.isFinite(max) ? max : null,
  percent: available ? percentage(current, max) : null
})
// Encode every code point, including punctuation, for deterministic CSS/SVG IDs.
const key = value => Array.from(String(value)).map(c => c.codePointAt(0).toString(16)).join('-')

export const chooseAnchor = (stages, progressEntries, currentSession) => {
  if (!stages.length) return null
  const stageFor = id => stages.find(s => s.choices.some(c => c._id === id))
  if (currentSession?.startedAt && !currentSession.completedAt && !currentSession.cancelledAt) {
    const stage = stageFor(currentSession.unitSet)
    if (stage) return stage.id
  }
  // Current backend updates array entries in place and does not write activity
  // timestamps. Legacy array order is a deterministic fallback, not proof of
  // last activity. Only sort by dates when the comparable entries all have
  // them; mixing timestamp and index comparisons is not a transitive ordering.
  const records = progressEntries.filter(entry => stageFor(entry._id)).map((entry, index) => ({
    entry, index, time: new Date(entry.updatedAt || entry.completedAt).getTime()
  }))
  if (records.every(record => Number.isFinite(record.time))) records.sort((a, b) => a.time - b.time || a.index - b.index)
  const activity = records.map(({ entry }) => entry).reverse()
  const incomplete = activity.find(e => e.complete === false && stageFor(e._id))
  if (incomplete) return stageFor(incomplete._id).id
  const completed = activity.find(e => e.complete === true && stageFor(e._id))
  if (!completed) return stages[0].id
  const stage = stageFor(completed._id)
  if (!stage.complete) return stage.id
  const next = stages[stages.indexOf(stage) + 1]
  if (next && !next.complete) return next.id
  // Q07 working interpretation: after immediate-next, search from journey end.
  return [...stages].reverse().find(s => !s.complete)?.id || stages[0].id
}

export const buildMapModel = ({ topology, dimensions = [], levels = [], icons = [], progress, progressAvailable = true, currentSession } = {}) => {
  if (!Array.isArray(topology?.entries)) throw new Error('map.invalidTopology')
  const fieldId = topology.field || ''
  const issues = []
  const offered = new Set(topology.entries.flatMap(e => (e.unitSets || []).map(u => u.dimension)))
  const slotIds = (topology.dimensions || []).filter((_, i) => offered.has(i)).map(d => d._id)
  const progressEntries = progressAvailable && Array.isArray(progress?.unitSets) ? progress.unitSets : []
  const byUnit = new Map(progressEntries.map(e => [e._id, e]))
  const configuredIcons = Array.isArray(icons) ? icons : []
  const iconNames = configuredIcons.filter(name => typeof name === 'string' && /^[a-z0-9-]+$/i.test(name))
  if (!iconNames.length || iconNames.length !== configuredIcons.length) issues.push('map.iconsUnavailable')
  let number = 0
  const entries = topology.entries.map(entry => {
    if (!['stage', 'milestone'].includes(entry.type)) throw new Error('map.invalidTopology')
    const levelId = topology.levels?.[entry.level]
    const level = levels.find(l => l._id === levelId)
    if (!level) issues.push('map.metadataUnavailable')
    const choices = (entry.unitSets || []).map(unit => {
      if (!unit._id) throw new Error('map.invalidTopology')
      const dimensionId = topology.dimensions?.[unit.dimension]?._id
      const dimension = dimensions.find(d => d._id === dimensionId)
      if (!dimension?.title || !dimension?.icon || !dimension?.color) issues.push('map.metadataUnavailable')
      const learner = byUnit.get(unit._id)
      const pages = metric(learner ? learner.progress : 0, unit.progress, progressAvailable)
      const competencies = metric(learner ? learner.competencies : 0, unit.competencies, progressAvailable)
      // Nonfinite values can be emitted by current Progress.update (undefined +=
      // progress). Surface unavailable values; do not repair persistence here.
      if (pages.percent === null || competencies.percent === null) issues.push('map.valuesUnavailable')
      return {
        _id: unit._id,
        code: unit.code,
        dimensionId,
        dimension: { _id: dimensionId, title: dimension?.title || unit.code || unit._id, icon: dimension?.icon, color: dimension?.color },
        slot: slotIds.indexOf(dimensionId),
        progress: pages,
        competencies,
        complete: progressAvailable && learner?.complete === true,
        diamondFill: diamondFraction(competencies.percent === null ? null : competencies.percent / 100)
      }
    })
    if (entry.type === 'stage' && !choices.length) throw new Error('map.invalidTopology')
    const membership = choices.map(c => `${c.dimensionId}:${c._id}`).sort().join('|')
    const id = `map-${key(fieldId)}-${key(levelId)}-${entry.type}-${key(membership)}`
    const isStage = entry.type === 'stage'
    return {
      _id: id,
      id,
      type: entry.type,
      isStage,
      number: isStage ? ++number : null,
      level: { _id: levelId, title: level?.title || '', number: entry.level + 1 },
      choices,
      complete: isStage && choices.every(c => c.complete),
      progress: metric(choices.every(c => c.progress.current !== null) ? choices.reduce((sum, c) => sum + c.progress.current, 0) : NaN, entry.progress, progressAvailable)
    }
  })
  if (new Set(entries.map(e => e.id)).size !== entries.length) throw new Error('map.invalidTopology')
  const stages = entries.filter(e => e.isStage)
  const sceneAvailable = !issues.some(i => i === 'map.iconsUnavailable' || i === 'map.metadataUnavailable')
  const marker = type => ({ _id: `map-${key(fieldId)}-${type}`, id: `map-${key(fieldId)}-${type}`, type, choices: [] })
  return freeze({
    fieldId,
    slotIds,
    stages,
    entries: stages.length ? [marker('start'), ...entries, marker('finish')] : [],
    icons: iconNames,
    issues: [...new Set(issues)],
    sceneAvailable,
    progressAvailable,
    anchorId: chooseAnchor(stages, progressEntries, currentSession?.fieldId === fieldId ? currentSession : null)
  })
}

export const layoutMap = (model, availableWidth) => {
  const width = Number.isFinite(availableWidth) ? Math.max(240, availableWidth) : 320
  const rowHeight = 136
  const height = (model.entries.length + 1) * rowHeight
  const inset = Math.max(76, width * 0.2)
  const entries = model.entries.map((entry, i) => ({
    ...entry,
    x: entry.isStage ? (entry.number % 2 ? width - inset : inset) : width / 2,
    y: height - (i + 1) * rowHeight,
    choices: entry.choices.map(choice => {
      const angle = Math.PI + (choice.slot + 1) * Math.PI / (model.slotIds.length + 1)
      return { ...choice, dx: Math.cos(angle) * 55, dy: Math.sin(angle) * 55 }
    })
  }))
  const connectors = entries.slice(1).map((entry, i) => {
    const previous = entries[i]
    const from = { x: previous.x, y: previous.y }
    const to = { x: entry.x, y: entry.y }
    const middle = (from.y + to.y) / 2
    return { from, to, path: `M ${from.x} ${from.y} C ${from.x} ${middle}, ${to.x} ${middle}, ${to.x} ${to.y}` }
  })
  return { width, height, entries, connectors }
}
