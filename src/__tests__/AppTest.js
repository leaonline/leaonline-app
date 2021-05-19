import React from 'react'

import renderer from 'react-test-renderer'
import { render } from '@testing-library/react-native'
import App from '../App'

const tree = renderer.create(<App />).toJSON()

jest.mock('react-native/Libraries/LogBox/LogBox');

it('renders correctly', () => {
  expect(tree).toMatchSnapshot()
})

test('render welcome text component correctly', () => {
  const rendered = render(<App />)
  const textComponent = rendered.getByTestId('textField')

  expect(textComponent.props.children).toEqual('Test Meteor Application')
})
