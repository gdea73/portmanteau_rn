import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';
import InstructionScreen from '../screens/InstructionScreen';
import HighScoreScreen from '../screens/HighScoreScreen';

const Root = createStackNavigator({
	Menu: MenuScreen,
	Game: GameScreen,
	Instructions: InstructionScreen,
	HighScores: HighScoreScreen,
}, {
	headerMode: 'screen',
	initialRouteName: 'Menu'
});

export default createAppContainer(Root);
