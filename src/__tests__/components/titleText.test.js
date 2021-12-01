import React from 'react'
import renderer from 'react-test-renderer'
import TitleText from '../../components/TitleText'
import Colors from '../../constants/Colors'

test('Text alignment left', () => {
  const tree = renderer.create(<TitleText
    style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'left' }}
    text='Hallo'
                               />)
  expect(tree).toMatchSnapshot()
})

test('Text alignment right', () => {
  const tree = renderer.create(<TitleText
    style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'right' }}
    text='Hallo'
                               />)
  expect(tree).toMatchSnapshot()
})

test('Text alignment center', () => {
  const tree = renderer.create(<TitleText
    style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'center' }}
    text='Hallo'
                               />)
  expect(tree).toMatchSnapshot()
})

test('Text color secondary', () => {
  const tree = renderer.create(<TitleText
    style={{ color: Colors.secondary, paddingLeft: 5, textAlign: 'center' }}
    text='Hallo'
                               />)
  expect(tree).toMatchSnapshot()
})