import { getPositionOnCircle } from '../../../lib/utils/trigonometry/getPositionOnCircle'

describe(getPositionOnCircle.name, function () {
  it('returns the n equally distributed positions on a circle by given radius', () => {
    const positions = getPositionOnCircle({ n: 3, radius: 1, precision: 5 })
    expect(positions).toStrictEqual([
      {
        x: 2,
        y: 1
      },
      {
        x: 0.5,
        y: 1.866
      },
      {
        x: 0.5,
        y: 0.13397
      }
    ])
  })
})
