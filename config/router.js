import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';

import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';
import InstructionScreen from '../screens/InstructionScreen';
import HighScoreScreen from '../screens/HighScoreScreen';

const Root = createStackNavigator({
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
