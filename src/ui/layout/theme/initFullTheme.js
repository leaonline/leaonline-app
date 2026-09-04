export const initFullTheme = async () => {
  console.debug('[theme]: import full theme')
  await import('bootstrap')
  await import('./theme.scss')
}
