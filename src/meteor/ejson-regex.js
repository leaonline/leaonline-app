import Meteor from '@meteorrn/core'

function getOptions (self) {
  const opts = []
  if (self.global) opts.push('g')
  if (self.ignoreCase) opts.push('i')
  if (self.multiline) opts.push('m')
  return opts.join('')
}

class EJSONRegExp extends RegExp {
  clone () {
    const self = this
    return new RegExp(self.source, getOptions(self))
  }

  equals (other) {
    if (!(other instanceof RegExp)) return false
    const self = this
    return EJSON.stringify(self) === EJSON.stringify(other)
  }

  typeName () {
    return 'RegExp'
  }

  toJSONValue () {
    const self = this
    return {
      regex: self.source,
      options: getOptions(self)
    }
  }
}

Meteor.EJSON.addType('RegExp', value => new RegExp(value.regex, value.options))
console.debug(Meteor.EJSON.stringify({ r: /abcd+/g }))
console.debug(Meteor.EJSON.parse(JSON.stringify({
  "EJSON$flags": "i",
  "EJSON$regexp": "er",
})))
