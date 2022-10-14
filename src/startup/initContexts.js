import { createCollection } from '../infrastructure/createCollection'
import { ContextRepository } from '../infrastructure/ContextRepository'
import { Field } from '../contexts/Field'
import { Dimension } from '../contexts/Dimension'
import { Level } from '../contexts/Level'
import { Sync } from '../infrastructure/sync/Sync'
import { Log } from '../infrastructure/Log'

const log = Log.create('startup')

export const initContexts = () => {
  ;[Field, Dimension, Level, Sync].forEach(context => {
    // in dev mode we may face the situation, where we fast-reload
    // the app and the following routines have already been executed
    // for such case we simply skip if we find the ctx in the repo
    if (ContextRepository.has(context.name)) {
      return log(context.name, 'already registered')
    }

    log(context.name, 'init collection')
    const collection = createCollection({
      name: context.name,
      isLocal: true
    })

    context.collection = () => collection

    ContextRepository.add(context.name, context)
    log(context.name, 'complete')
  })

}
