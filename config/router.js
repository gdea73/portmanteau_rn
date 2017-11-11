import React from 'react';
import { StackNavigator } from 'react-navigation';

import SplashScreen from '../screens/SplashScreen';
import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';
import InstructionScreen from '../screens/InstructionScreen';

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
	Instructions: {
		screen: InstructionScreen,
	},
}, {
	headerMode: 'screen',
});

export default Root;
