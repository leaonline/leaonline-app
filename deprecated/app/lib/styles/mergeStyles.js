export const mergeStyles = (mainStyle, ...optionalStyles) => {
  if (optionalStyles.length === 0) {
    return mainStyle
  }

  const styles = { ...mainStyle }
  optionalStyles.forEach(obj => Object.assign(styles, obj))
  return styles
}
