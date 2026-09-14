// TODO add date-time-options
export default {
  de: {
    code: 'de',
    isoCode: 'de-DE',
    name: 'Deutsch',
    load: async () => await import('./de/i18n')
  }
}
