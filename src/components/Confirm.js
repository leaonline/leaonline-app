import React, { useState } from 'react'
import { View, Modal } from 'react-native'
import { ActionButton } from './ActionButton'
import { createStyleSheet } from '../styles/createStyleSheet'
import { useTts } from './Tts'
import Colors from '../constants/Colors'

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
    return (<Tts style={styles.modalText} text={props.question} color={Colors.secondary} iconColor={Colors.secondary} />)
  }

  const onResponse = (targetFn) => {
    setModalOpen(false)
    setTimeout(() => {
      if (targetFn) targetFn()
    }, 250)
  }

  const renderIcon = () => {
    if (props.noButton) {
      return null
    }
    if (props.noConfirm) {
      return <ActionButton {...fordwardedProps} onPress={() => onResponse(onApprove)} />
    }
    else {
      return <ActionButton {...fordwardedProps} onPress={() => setModalOpen(true)} />
    }
  }

  const renderApprove = () => {
    if (!onApprove) {
      return null
    }
    return (<ActionButton text={props.approveText} onPress={() => onResponse(onApprove)} />)
  }
  const renderDeny = () => {
    if (!onDeny) {
      return null
    }
    return (<ActionButton text={props.denyText} onPress={() => onResponse(onDeny)} />)
  }

  return (
    <>
      <Modal
        animationType='fade'
        transparent={false}
        visible={getModalOpen()}
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {renderQuestion()}

            <View style={styles.footer}>
              {renderApprove()}
              {renderDeny()}
            </View>
          </View>
        </View>
      </Modal>
      {renderIcon()}
    </>
  )
}

const styles = createStyleSheet({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  footer: {
    width: '100%',
    height: '50%'
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
  }
})
