import React from 'react';
import { StackNavigator } from 'react-navigation';

import SplashScreen from '../screens/SplashScreen';
import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';

const Root = StackNavigator({
	SplashScreen: {
		screen: SplashScreen,
	},
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
