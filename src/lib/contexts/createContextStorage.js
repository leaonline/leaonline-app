import Meteor from '@meteorrn/core'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCollection } from '../infrastructure/collections/collections'
import { toArrayIfNot } from '../utils/toArrayIfNot'

const { EJSON } = Meteor

export const createContextStorage = ({ name }) => {
  return new ContextStorage({ name })
}

class ContextStorage {
  constructor ({ name }) {
    this.key = `contexts-${name}`
    this.name = name
  }

  async loadIntoCollection () {
    let docs = await loadDocs(this.key) ?? []
    const collection = getCollection(this.name)
    docs = toArrayIfNot(docs)
    for (const doc of docs) {
      await collection.insert(doc)
    }
  }

  async saveFromCollection () {
    const collection = getCollection(this.name)
    const docs = collection.find().fetch()
    return docs.length && saveDocs(this.key, docs)
  }
}

const loadDocs = async (key) => {
  const docsStr = await AsyncStorage.getItem(key)
  if (docsStr) {
    return EJSON.parse(docsStr)
  }
}

const saveDocs = async (key, docs) => {
  const docsStr = EJSON.stringify(docs)
  return await AsyncStorage.setItem(key, docsStr)
}
