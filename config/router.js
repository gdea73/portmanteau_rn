import React from 'react';
import { StackNavigator } from 'react-navigation';

import SplashScreen from '../screens/SplashScreen';
import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';
import InstructionScreen from '../screens/InstructionScreen';
import HighScoreScreen from '../screens/HighScoreScreen';

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
	HighScores: {
		screen: HighScoreScreen,
	},
}, {
	headerMode: 'screen',
});

export default Root;
