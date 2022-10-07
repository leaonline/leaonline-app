import { AppState } from '../../state/AppState'

const src = new Map()
const testStorage = {
  getItem: async key => src.get(key),
  setItem: async (key, value) => src.set(key, value),
  removeItem: async key => src.delete(key)
}

beforeAll(() => AppState.init(testStorage))
beforeEach(() => src.clear())

const testUpdateSingle = async (targetFn) => {
  AppState.init(null)
  await expect(targetFn(undefined)).rejects.toThrow('appState.noStorage');
  AppState.init(testStorage)
  expect(await targetFn(undefined)).toEqual(undefined)
  await targetFn('foo')
  expect(await targetFn(undefined)).toEqual('foo')
  await targetFn('bar')
  expect(await targetFn(undefined)).toEqual('bar')
  await targetFn(null)
  expect(await targetFn(undefined)).toEqual(undefined)
}

;[
  AppState.field,
  AppState.stage,
  AppState.unitSet
].forEach(targetFn => it(targetFn.name, async () => testUpdateSingle(targetFn)))

it(AppState.complete.name, async () => {
  expect(await AppState.complete(undefined)).toEqual(undefined)
  await AppState.complete(0)
  expect(await AppState.complete(undefined)).toEqual(0)
  await AppState.complete(0)
  expect(await AppState.complete(undefined)).toEqual(0)
  await AppState.complete(1)
  expect(await AppState.complete(undefined)).toEqual(1)
  await AppState.complete(1)
  expect(await AppState.complete(undefined)).toEqual(2)
  await AppState.complete(-1)
  expect(await AppState.complete(undefined)).toEqual(1)
  await AppState.complete(null)
  expect(await AppState.complete(undefined)).toEqual(undefined)
})
