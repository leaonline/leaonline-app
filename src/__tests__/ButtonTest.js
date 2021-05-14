import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Alert } from 'react-native'
import App from '../App'

test('test button press with expexted value', () => {
  const rendered = render(<App />)
  const testButton = rendered.getByTestId('Button')

  jest.spyOn(Alert, 'alert')

  fireEvent.press(testButton)

  expect(Alert.alert).toHaveBeenCalled()
  expect(Alert.alert).toHaveBeenCalledWith('Button is working')
})
