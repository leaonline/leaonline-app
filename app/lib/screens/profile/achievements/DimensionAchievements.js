import React, { useState } from 'react'
import { ListItem } from 'react-native-elements'
import Icon from '@expo/vector-icons/FontAwesome6'
import { Colors } from '../../../constants/Colors'
import { View } from 'react-native'
import { LeaText } from '../../../components/LeaText'
import { StaticCircularProgress } from '../../../components/progress/StaticCircularProgress'
import { useTts } from '../../../components/Tts'
import { Diamond } from '../../../components/progress/Diamond'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { isDefined } from '../../../utils/object/isDefined'

const RenderDimensionAchievements = props => {
  const { Tts } = useTts()
  const [opened, setOpened] = useState()
  const { dimensions, fields } = props

  return dimensions.map((dimensionDoc) => {
    const isSelected = opened === dimensionDoc._id
    return (
      <ListItem.Accordion
        key={dimensionDoc._id}
        style={styles.listItem}
        containerStyle={styles.listItemContainer}
        noIcon
        isExpanded={isSelected}
        onPress={() => isSelected
          ? setOpened(null)
          : setOpened(dimensionDoc._id)}
        content={
          <>
            <Tts
              color={dimensionDoc.color}
              dontShowText
              text={dimensionDoc.title}
            />
            <View style={styles.listIconButton}>
              <Icon
                name={dimensionDoc.icon}
                color={dimensionDoc.color}
                style={styles.listItemIcon}
                size={20}
              />
              <ListItem.Content>
                <LeaText style={{
                  color: dimensionDoc.color,
                  alignSelf: 'center',
                  fontWeight: 'bold'
                }}
                >{dimensionDoc.title}
                </LeaText>
              </ListItem.Content>
              <StaticCircularProgress
                radius={16}
                style={styles.listItemProgress}
                value={dimensionDoc.progress}
                activeStrokeWidth={3}
                activeStrokeColor={dimensionDoc.color}
                textColor={dimensionDoc.color}
                inActiveStrokeWidth={3}
                valueSuffix='%'
              />
            </View>
          </>
        }
      >
        {fields.map((fieldDoc) => {
          const diamonds = new Array(5)
          const fieldAchievements = dimensionDoc.competencies[fieldDoc._id]

          // some combinations of dimension-field are not defined
          // which is why we need to skip rendering at this point
          if (!isDefined(fieldAchievements)) {
            return null
          }

          const percent = fieldAchievements.value

          // 5 diamonds
          diamonds[0] = percent > 0 ? 100 : 0
          diamonds[1] = percent > 20 ? 100 : 0
          diamonds[2] = percent > 40 ? 100 : 0
          diamonds[3] = percent > 60 ? 100 : 0
          diamonds[4] = percent > 80 ? 100 : 0

          return isSelected && (
            <ListItem
              bottomDivider={false}
              key={`${dimensionDoc._id}-${fieldDoc._id}`}
              containerStyle={styles.listItemSubContainer}
            >
              <ListItem.Content style={styles.listItemRow}>
                <Tts color={Colors.secondary} text={fieldDoc.title} dontShowText />
                <View style={styles.listItemRowContent}>
                  <LeaText>{fieldDoc.title}</LeaText>
                  <View style={styles.diamondsRow}>
                    {diamonds.map((diamond, index) => (
                      <Diamond
                        key={index}
                        color={dimensionDoc.color}
                        value={diamond}
                        width={20}
                        height={40}
                      />
                    ))}
                  </View>
                </View>
              </ListItem.Content>
            </ListItem>
          )
        })}
        {isSelected && <View style={styles.lastItem} />}
      </ListItem.Accordion>
    )
  })
}

export const DimensionAchievements = React.memo(RenderDimensionAchievements)

const styles = createStyleSheet({
  listItem: {
    marginTop: 20
  },
  listItemContainer: {
    backgroundColor: Colors.transparent,
    padding: 0,
    flex: 1
  },
  listItemSubContainer: {
    backgroundColor: Colors.transparent,
    padding: 0,
    marginTop: 5,
    marginLeft: 15
  },
  listIconButton: {
    marginLeft: 3,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 65
  },
  listItemIcon: {
    marginLeft: 10
  },
  listItemRow: {
    marginLeft: 3,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  listItemRowContent: {
    backgroundColor: Colors.white,
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    minHeight: 65,
    padding: 5
  },
  listItemProgress: {
    marginRight: 10
  },
  progressTitle: {
    alignItems: 'flex-start'
  },
  diamondsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: '30%',
    marginRight: '30%'
  },
  lastItem: {
    height: 25
  }
})
