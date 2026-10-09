import { Progress } from '../progress/Progress'
import { Session } from '../session/Session'
import { Unit } from '../content/Unit'
import { getCollection } from '../../api/utils/getCollection'

/**
 *
 * @async
 * @param param0
 * @param param0.sessionId
 * @param param0.userId
 * @return {Promise<*|number>}
 */
export const updateProgress = async ({ sessionId, userId }) => {
  const sessionDoc = await getCollection(Session.name).findOneAsync({
    _id: sessionId,
    userId,
  })
  const unitDoc = await getCollection(Unit.name).findOneAsync({
    _id: sessionDoc?.unit,
  })

  if (sessionDoc && unitDoc?.pages?.length) {
    return Progress.update({
      userId: userId,
      unitSetId: sessionDoc.unitSet,
      fieldId: sessionDoc.fieldId,
      progress: unitDoc.pages.length,
      dimensionId: sessionDoc.dimensionId,
      competencies: sessionDoc.competencies,
      complete: false, // TODO how to determine completeness?
    })
  }

  return 0
}
