import React from 'react';
import { AsyncStorage } from 'react-native';

import Constants from './Constants';

const AS_GAME_KEY = 'portmanteau:savedGame';
const AS_SCORES_KEY = 'portmanteau:highScores';
const AS_WORDS_BROKEN_KEY = 'portmanteau:words_broken';

class Storage {
	static saveGame(gameStats, dropLetter, cols, tileSet) {
		var savedGame = {
			gameStats,
			dropLetter,
			cols,
			tileSet
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
	static save_words_broken(words_broken) {
		return AsyncStorage.setItem(AS_WORDS_BROKEN_KEY, JSON.stringify(words_broken));
	}
	static load_words_broken() {
		return AsyncStorage.getItem(AS_WORDS_BROKEN_KEY);
	}
}

export default Storage;
