import React from 'react';
import { StackNavigator } from 'react-navigation';

import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';

const Root = StackNavigator({
	Menu: {
		screen: MenuScreen,
	},
	Game: {
		screen: GameScreen,
	},
}, {
	headerMode: 'none',
});

export default Root;
