import React, { useState } from 'react'
import { View, Modal, Pressable } from 'react-native'
import { ActionButton } from './ActionButton'
import { createStyleSheet } from '../styles/createStyleSheet'
import { useTts } from './Tts'
import Colors from '../constants/Colors'
import { Icon } from 'react-native-elements'
import { makeTransparent } from '../styles/makeTransparent'

/**
 * A base-modal with confirm actions and respective state and callbacks.
 *
 * @category Components
 * @component
 * @param props {object}
 * @param props.question {string} the question to ask the user to confirm, i.e. "do you want to..."
 * @param props.approveText {string} the text for the approve button
 * @param props.denyText {string} the text for the deny button
 * @param props.onApprove {function=}
 * @param props.onDeny {function=}
 * @param props.open {boolean=} Initial / externally defined open/closed state
 * @param props.noButton {boolean=}
 * @param props.noConfirm {boolean=}
 * @returns {JSX.Element}
 */
export const Confirm = props => {
  const { Tts } = useTts()
  const [modalOpen, setModalOpen] = useState(false)
  const { onApprove, onDeny, open, ...fordwardedProps } = props

  const getModalOpen = () => {
    if (typeof open === 'boolean') {
      return open
    }
    return modalOpen
  }

  const renderQuestion = () => {
    if (!props.question) { return null }
    return (<Tts block style={styles.modalText} text={props.question} color={Colors.secondary} iconColor={Colors.secondary} />)
  }

  const onResponse = (targetFn) => {
    setModalOpen(false)
    setTimeout(() => {
      if (targetFn) targetFn()
    }, 250)
  }

  const renderButton = () => {
    if (props.noButton) {
      return null
    }

    const onPress = props.noConfirm
      ? () => onResponse(onApprove)
      : () => setModalOpen(true)

    if (props.pressable) {
      return (
        <Pressable style={styles.buttonContainer} onPress={onPress}>
          <Icon
            name={props.icon} type='font-awesome-5' color={Colors.secondary}
            style
            size={18}
          />
        </Pressable>
      )
    }

    return (<ActionButton {...props.buttonProps} onPress={onPress} />)
  }

  const renderApprove = () => {
    if (!onApprove) {
      return null
    }
    return (
      <ActionButton
        containerStyle={styles.button}
        block
        color={Colors.secondary}
        text={props.approveText}
        icon={props.approveIcon}
        onPress={() => onResponse(onApprove)}
      />
    )
  }
  const renderDeny = () => {
    if (!onDeny) {
      return null
    }
    return (
      <ActionButton
        containerStyle={styles.button}
        block
        color={Colors.secondary}
        text={props.denyText}
        icon={props.denyIcon}
        onPress={() => onResponse(onDeny)}
      />
    )
  }

  return (
    <>
      <Modal
        animationType='fade'
        transparent
        visible={getModalOpen()}
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.background}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {renderQuestion()}

              <View style={styles.footer}>
                {renderApprove()}
                {renderDeny()}
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {renderButton()}
    </>
  )
}

const styles = createStyleSheet({
  background: {
    flex: 1,
    flewGrow: 1,
    backgroundColor: makeTransparent(Colors.dark, 0.4)
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  footer: {
    flex: 0,
    alignItems: 'flex-start'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: '5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center'
  },
  buttonContainer: {
    display: 'flex',
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: Colors.secondary,
    padding: 10,
    borderRadius: 3
  },
  button: {
    marginBottom: 5,
    marginTop: 5
  }
})
