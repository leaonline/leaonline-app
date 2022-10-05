import React, { useState } from 'react'
import { Pressable, Modal, View } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'
import { ActionButton } from './ActionButton'
import Colors from '../constants/Colors'
import LeaText from './LeaText'

/**
 * Renders a pressable element that triggers a Modal dialog with
 * a select list.
 *
 * This enables us to avoid to use third-party components that have
 * an uncertain future of maintenance while at the same time stay
 * compatible for the native platforms.
 *
 * @param props
 * @constructor
 */
export const Select = props => {
  const { color } = props
  const [modalVisible, setModalVisible] = useState(false)

  const onSelect = (option, index) => {
    setModalVisible(!modalVisible)
    setTimeout(() => {
      props.onSelect(option, index)
    }, 250)
  }

  const label = props.value !== undefined && props.value !== null
    ? props.options[props.value]
    : ''
  return (
    <View>
      <Modal
        animationType='fade'
        transparent
        visible={modalVisible}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {props.options.map((option, index) => (
              <ActionButton
                key={index}
                text={option}
                color={color}
                onPress={() => onSelect(option, index)}
              />
            ))}
          </View>
        </View>
      </Modal>

      <Pressable style={styles.select} onPress={() => setModalVisible(true)}>
        <LeaText style={props.labelStyle}>{label}</LeaText>
      </Pressable>
    </View>
  )
}

const styles = createStyleSheet({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 5
  },
  select: {
    paddingLeft: 10,
    paddingRight: 10,
    minWidth: 50,
    backgroundColor: Colors.gray,
    color: Colors.light,
    alignItems: 'center'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: '#F194FF'
  },
  buttonClose: {
    backgroundColor: '#2196F3'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center'
  }
})
