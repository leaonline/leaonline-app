// we use a simple RAM cache for the map data
// so it's only loaded once per session but we never
// persist it in order to obtain new changes from the server
const mapCache = new Map()

export const getMapCache = () => mapCache
