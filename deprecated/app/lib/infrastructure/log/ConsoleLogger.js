/* eslint-disable no-console */
export const ConsoleLogger = {
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  fatal: (...args) => console.error(...args)
}
/* eslint-enable no-console */
