import React from 'react'
import { Pressable, View } from 'react-native'
import { Icon } from 'react-native-elements'
import Colors from '../constants/Colors'
import { useNavigation } from '@react-navigation/native'
import { createStyleSheet } from '../styles/createStyleSheet'

export const BackButton = (props) => {
  const navigation = useNavigation()
  const handleOnPress = async () => {
    if (props.onPress) {
      await props.onPress()
    }
    return navigation.goBack()
  }

  return (
    <Pressable style={styles.buttonContainer} onPress={handleOnPress}>
      <Icon
        name={props.icon} type="font-awesome-5" color={Colors.secondary}
        style
        size={18}
      />
    </Pressable>
  )
}

const styles = createStyleSheet({
  buttonContainer: {
    display: 'flex',
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: Colors.secondary,
    padding: 10,
    borderRadius: 3
  }
})