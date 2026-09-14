let detected
let types

export const getOSInfo = async function () {
  if (detected) return { detected, types }
  const Detector = (await import('detect-os')).default
  const detector = new Detector()
  detector.detect()
  detected = detector.detected
  types = Detector.types
  return { detected, types }
}
