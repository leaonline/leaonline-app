import React from 'react'
import Svg, { G, Path } from 'react-native-svg'

/**
 * Represents a milestone for a given level.
 * Summarizes all obtainable competencies for each given dimension.
 *
 * @param props {object}
 * @param props.level {number} the milestones level value, 1..n
 *   will determine number of stars
 * @component
 * @returns {JSX.Element}
 */
const MilestoneComponent = (props) => {
  return (
    <Svg width={100} height={100} viewBox='0 0 51.73 70.49'>
      <G id='Ebene_2' data-name='Ebene 2'>
        <G id='Ebene_1-2' data-name='Ebene 1'>
          <G id='Gruppe_79' data-name='Gruppe 79'>
            <Path
              id='Pfad_103' data-name='Pfad 103' fill='#192c3d'
              d='M51.05,41.75c-7.1-1.21-21.49-3.5-25.24-3.5C21.13,38.25.86,41.58.65,41.61L2.42,37.7,0,34.25c.85-.14,20.81-3.41,25.81-3.41s25.07,3.41,25.92,3.56l-2.66,3.3Z'
            />
          </G>
          <G id='Gruppe_80' data-name='Gruppe 80'>
            <Path id='Pfad_104' data-name='Pfad 104' fill='#86c4f1' d='M25.68,0,3.29,35.24H48.06Z' />
            <Path id='Pfad_105' data-name='Pfad 105' fill='#00ddb6' d='M25.68,70.49,48.06,35.24H3.29' />
            <Path id='Pfad_106' data-name='Pfad 106' fill='#ffc800' d='M25.68,35.24V0L48.06,35.24Z' />
            <Path id='Pfad_107' data-name='Pfad 107' fill='#e3adbc' d='M25.68,35.24V70.49L48.06,35.24Z' />
          </G>
          <G id='Pfad_108' data-name='Pfad 108'>
            <Path fill='none' d='M25.68,0,3.29,35.24,25.68,70.49,48.06,35.24Z' />
            <Path
              fill='#183b5e'
              d='M25.68,3.73l-20,31.51,20,31.52,20-31.52-20-31.51m0-3.73L48.06,35.24,25.68,70.49,3.29,35.24Z'
            />
          </G>
          <Path
            id='Pfad_109' data-name='Pfad 109' fill='none'
            stroke='#183b5e' strokeMiterlimit={10} strokeWidth={12}
            d='M3.29,37.14s16.89-.82,22.39-.82,22.38.82,22.38.82'
          />
          {getStars(props.level)}
        </G>
      </G>
    </Svg>
  )
}

const getStars = (value) => {
  const stars = []
  stars.length = value

  const xOffsetLeft = ((value - 1) * 9) / 2

  for (let i = 0; i < value; i++) {
    stars[i] = (<MilestoneStar key={i} index={i} xOffsetLeft={xOffsetLeft} />)
  }

  return stars
}

const MilestoneStar = React.memo((props) => {
  const { index, xOffsetLeft } = props
  return (
    <Path
      key={`milestone-star-${index}`}
      translateX={(index * 9) - xOffsetLeft}
      id='Pfad_123-2' data-name='Pfad 123-2' fill='white'
      d='M25.37,32.76l-1,2-2.25.32a.5.5,0,0,0-.42.56.48.48,0,0,0,.15.28l1.62,1.59-.38,2.24a.49.49,0,0,0,.4.57.54.54,0,0,0,.31,0l2-1.06,2,1.06a.5.5,0,0,0,.66-.21.49.49,0,0,0,.05-.31l-.39-2.24L29.78,36a.48.48,0,0,0,0-.69.51.51,0,0,0-.28-.15l-2.25-.32-1-2a.48.48,0,0,0-.66-.22.43.43,0,0,0-.22.22Z'
    />
  )
})

export const Milestone = React.memo(MilestoneComponent)
