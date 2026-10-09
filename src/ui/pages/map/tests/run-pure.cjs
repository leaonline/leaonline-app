// Supplemental pure-logic checks; this does not replace Meteor/browser tests.
// node --experimental-vm-modules tests/run-pure.cjs /path/to/mocha
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const Mocha = require(process.argv[2] || 'mocha')
const mocha = new Mocha()
const modules = new Map()
mocha.suite.emit('pre-require', global, __filename, mocha)

async function load(filename) {
  if (modules.has(filename)) return modules.get(filename)
  const source = fs.readFileSync(filename, 'utf8')
  const module = new vm.SourceTextModule(
    filename.endsWith('.json') ? `export default ${source}` : source,
    { identifier: filename },
  )
  modules.set(filename, module)
  await module.link(async (specifier, parent) => {
    if (specifier === 'chai') {
      if (!modules.has('chai')) {
        const chai = require('chai')
        modules.set(
          'chai',
          new vm.SyntheticModule(['expect'], function () {
            this.setExport('expect', chai.expect)
          }),
        )
      }
      return modules.get('chai')
    }
    return load(path.resolve(path.dirname(parent.identifier), specifier))
  })
  return module
}

async function run() {
  for (const file of ['model.tests.js', 'navigation.tests.js']) {
    await (await load(path.join(__dirname, file))).evaluate()
  }
  mocha.run((failures) => {
    process.exitCode = failures ? 1 : 0
  })
}
run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
