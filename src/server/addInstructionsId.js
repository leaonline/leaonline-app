import { Unit } from '../contexts/content/Unit'
import { ContentServer } from '../api/remotes/content/ContentServer'
import crypto from 'crypto'

const md5 = str => crypto.createHash('md5').update(str).digest('hex').toString()
const hashes = new Set()
const { beforeSyncUpsert, syncEnd } = ContentServer.hooks

ContentServer.on(beforeSyncUpsert, Unit.name, ({ type, doc }) => {
  const value = doc.instructions?.[0]?.value
  if (value) {
    hashes.add(md5(value))
  }
})

ContentServer.on(syncEnd, Unit.name, () => {
  console.error('sync end', hashes)
})
