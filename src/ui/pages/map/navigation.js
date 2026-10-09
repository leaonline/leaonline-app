export const resolvePosition = (model, hints = {}, returnId) => {
  const explicit = model.stages.find(s => s.id === hints.stage) ||
    model.stages.find(s => s.choices.some(c => c._id === hints.unitSet))
  return {
    currentId: explicit?.id || model.stages.find(s => s.id === returnId)?.id || model.anchorId,
    selectedId: explicit?.id || null
  }
}

// All mutations originate in an explicit UnitSet click. The caller owns the
// busy lock and checks account/field/lifecycle after every asynchronous step.
export const sessionSelection = async ({ unitSetId, userId, fieldId, lookup, decide, restart, advance, start, active }) => {
  let docs = await lookup(unitSetId)
  if (!active()) return null
  const validate = () => {
    if (!docs?.sessionDoc?._id || docs.unitSetDoc?._id !== unitSetId || docs.sessionDoc.unitSet !== unitSetId || docs.sessionDoc.completedAt) {
      throw new Error('map.sessionFailed')
    }
    if ((userId && docs.sessionDoc.userId !== userId) ||
      (fieldId && (docs.sessionDoc.fieldId !== fieldId || docs.unitSetDoc.field !== fieldId)) ||
      (docs.sessionDoc.unit && !docs.unitSetDoc.units?.includes(docs.sessionDoc.unit))) {
      throw new Error('map.sessionFailed')
    }
  }
  validate()
  const original = docs.sessionDoc
  // The existing getter may create a Session and does not return an isNew
  // discriminator. A first unit with no recorded work is indistinguishable
  // from an untouched new attempt; it safely enters that same first unit.
  const hasWork = original.unit && (original.unit !== docs.unitSetDoc.units?.[0] || original.progress > 0 || original.updatedAt)
  if (hasWork) {
    const decision = await decide()
    if (!active() || !['continue', 'restart'].includes(decision)) return null
    if (decision === 'restart') {
      docs = await restart(original._id)
      if (!active()) return null
      validate()
      if (docs.sessionDoc._id !== original._id) throw new Error('map.sessionFailed')
    }
  }
  const { sessionDoc, unitSetDoc } = docs
  const showStory = !sessionDoc.unit && !!unitSetDoc.story?.length
  let unitId = sessionDoc.unit
  if (!showStory && !unitId) {
    // Existing restart always resets nextUnit, including storyless UnitSets.
    unitId = await advance(sessionDoc._id)
    if (!active()) return null
    if (!unitId) throw new Error('map.sessionFailed')
    // Reload the authoritative current unit before installing the local Session.
    // Session.update's client wrapper has a different return/cache shape; keep
    // this selection path on the established method boundary.
    docs = await lookup(unitSetId)
    if (!active()) return null
    validate()
    if (docs.sessionDoc._id !== sessionDoc._id || docs.sessionDoc.unit !== unitId) throw new Error('map.sessionFailed')
  }
  if (!showStory && !unitId) throw new Error('map.sessionFailed')
  start(docs)
  return { sessionId: sessionDoc._id, unitSetId, unitId, showStory }
}
