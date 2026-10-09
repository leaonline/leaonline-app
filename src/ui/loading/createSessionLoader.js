import { loadContentDoc } from './loadContentDoc'
import { Level } from '../../contexts/content/Level'
import { Dimension } from '../../contexts/content/Dimension'
import { ColorType } from '../../contexts/types/ColorType'
import { Unit } from '../../contexts/content/Unit'
import { Env } from '../../infrastructure/env/Env'
import { Meteor } from 'meteor/meteor'

const contentServer = Meteor.settings.public.hosts.content
const contentRoot = contentServer.url.endsWith('/')
  ? contentServer.url
  : `${contentServer.url}/`
const updateImage = element => {
  if (element.subtype === 'image') {
    element.value = element.value.replace('https://content.lealernen.de/', contentRoot)
    console.debug('update image value:', element.value)
  }
}
/**
 * Loads associated docs for the current session state.
 * @param sessionDoc
 * @param unitSetDoc
 * @return {Promise<{dimensionDoc: Object, color: *, levelDoc: Object, unitSetDoc, sessionDoc, unitDoc: (*|Object)}>}
 */
export const loadSessionDocs = async ({ sessionDoc, unitSetDoc }) => {
  const unitId = sessionDoc.unit ?? sessionDoc.nextUnit
  const unitDoc = unitId && await loadContentDoc({ context: Unit, query: { _id: unitId }, unlessExists: true })

  // XXX: this is a hotfix for a bad design decision from the past
  // where the remote url of the image is basically hard-coded
  Env.on('dev', () => {
    if (unitSetDoc?.story) {
      for (const element of unitSetDoc.story) {
        updateImage(element)
      }
    }
    if (unitDoc?.instructions) {
      for (const element of unitDoc.instructions) {
        updateImage(element)
      }
    }
    if (unitDoc?.stimuli) {
      for (const element of unitDoc.stimuli) {
        updateImage(element)
      }
    }
    if (unitDoc?.pages) {
      for (const page of unitDoc.pages) {
        for (const element of page.content) {
          updateImage(element)
        }
      }
    }
  })

  const levelDoc = unitSetDoc && await loadContentDoc({
    context: Level,
    query: { _id: unitSetDoc?.level },
    unlessExists: true
  })
  const dimensionDoc = unitSetDoc && await loadContentDoc({
    context: Dimension,
    query: { _id: unitSetDoc?.dimension },
    unlessExists: true
  })

  const colorType = dimensionDoc && ColorType.byIndex(dimensionDoc?.colorType)
  const color = colorType?.type

  return { sessionDoc, unitSetDoc, unitDoc, levelDoc, dimensionDoc, color }
}
