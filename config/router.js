import React from 'react';
import { StackNavigator } from 'react-navigation';

import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';
import InstructionScreen from '../screens/InstructionScreen';
import HighScoreScreen from '../screens/HighScoreScreen';
import DictionaryScreen from '../screens/DictionaryScreen';

const Root = StackNavigator({
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
	Dictionary: {
		screen: DictionaryScreen,
	}
}, {
	headerMode: 'screen',
});

export default Root;
