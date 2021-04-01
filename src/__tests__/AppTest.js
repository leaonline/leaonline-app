import React from 'react';
import App, {Text} from '../App';

import renderer from 'react-test-renderer';
import {render, cleanup, fireEvenet} from '@testing-library/react-native';
import { testEnvironment } from '../jest.config';

const tree = renderer.create(<App />).toJSON();

it('renders correctly', () => {
    
    expect(tree).toMatchSnapshot();
});

test('render welcome text component correctly', () => {
    const rendered = render(<App/>);

    const textComponent = rendered.getByTestId('textField');

    expect(textComponent.props.children).toEqual('Test Meteor Application');

})