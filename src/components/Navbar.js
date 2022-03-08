import React from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { createStyleSheet } from '../styles/createStyleSheet'

const styles = createStyleSheet({
  navbar: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignContent: 'space-between',
    padding: 4
  }
})

export const Navbar = props => {
  return (
    <KeyboardAvoidingView
      style={styles.navbar}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {props.children}
    </KeyboardAvoidingView>
  )
}
