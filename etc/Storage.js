import React from 'react';
import { AsyncStorage } from 'react-native';

import Constants from './Constants';

const AS_GAME_KEY = 'portmanteau:savedGame';
const AS_SCORES_KEY = 'portmanteau:highScores';

class Storage {
	static saveGame(gameStats, dropLetter, cols) {
		var savedGame = {
			gameStats,
			dropLetter,
			cols
		};
		return AsyncStorage.setItem(AS_GAME_KEY, JSON.stringify(savedGame));
	}
	static loadGame() {
		return AsyncStorage.getItem(AS_GAME_KEY);
	}
	static removeSavedGame() {
		return AsyncStorage.removeItem(AS_GAME_KEY);
	}
	static saveHighScores(scores) {
		return AsyncStorage.setItem(AS_SCORES_KEY, JSON.stringify(scores));
	}
	static loadHighScores() {
		return AsyncStorage.getItem(AS_SCORES_KEY);
	}
}

export default Storage;
