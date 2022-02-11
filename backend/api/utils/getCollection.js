import { Mongo } from 'meteor/mongo'

export const getCollection = name => Mongo.Collection.get(name)
