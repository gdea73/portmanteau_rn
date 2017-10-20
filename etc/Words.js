var RNFS = require('react-native-fs');

const pointValues = { 
    A: 1,
	B: 3,
	C: 3,
	D: 2,
	E: 1,
	F: 4,
	G: 2,
	H: 4,
	I: 1,
	J: 8,
	K: 5,
	L: 1,
	M: 3,
    N: 1,
	O: 1,
	P: 3,
	Q: 10,
	R: 1,
	S: 1,
	T: 1,
	U: 1,
	V: 4,
	W: 4,
	X: 8,
	Y: 4,
	Z: 10
};

const lengthMultipliers = [
	// TODO: solicit user feedback on factorial increase
	0, // shouldn't be calculating score with length 0
	1, // 								 	  ... or 1, for that matter
	2,
	6,
	24,
	120,
	720,
	5040 // seems absurd, but this is BOARD_SIZE, so this is hard to do.
];

var dictLoaded = false;
var dictionary = [];

class Words {
	static loadDictionary() {
		if (!dictLoaded) {
			console.debug('attempting to load dictionary from bundle...');
			// get a list of files and directories in the main bundle
			RNFS.readFileAssets('dictionary.txt', 'utf8')
				.then((result) => {
					console.debug('got dictionary from resources; splitting (slow)...');
					dictionary = result.split(/\n/g);
					console.debug('dict[73] === ' + dictionary[73]);
					dictLoaded = true;
			});
		}
	}
	static isValidWord(string) {
		// just poll until the dictionary is loaded, though this may slow down
		// that process; it'll only happen if the player taps a column within
		// roughly 1 second of the game first loading.
		while (!dictLoaded);
		if (string.length < 2) {
			return false;
		}
		return this.binSearch(string, 0, dictionary.length);
	}
	static binSearch(string, start, end) {
		if (start === end) {
			// as close as it gets
			return !!(string === words[end]);
		}
		var midpt = Math.floor((start + end) / 2);
		if (string < dictionary[midpt]) {
			return this.binSearch(string, start, midpt);
		}
		if (string > dictionary[midpt]) {
			return this.binSearch(string, midpt + 1, end);
		}
		// if reached, we must have found the string
		// console.debug('end of binsearch reached, string is ' + string + '; midpt of dict here is ' + dictionary[midpt]);
		return !!(string === dictionary[midpt]);
	}
	static getWordScore(word, chainLevel) {
		var score = 0;
		for (let c = 0; c < word.length; c++) {
			score += pointValues[word.charAt(c)];
		}
		score *= lengthMultipliers[word.length];
		// TODO: solicit user feedback on square increase
		score *= chainLevel * chainLevel;
		console.debug('score post-multipliers (chainLevel ' + chainLevel + '): ' + score);
		return score;
	}

	/* parameters:
		word as an object in the following format:
		var word = {
			startCol: 0,
			endCol: BOARD_SIZE - 1
			startRow: 1,
			endRow: 1
		};
		The above is an example, but the important thing is that EITHER
			startCol === endCol (vertical word), OR
			startRow === endRow (horizontal word).
		board as an array of arrays of single-character strings, each with
		length === BOARD_SIZE.
		return value: the string read from the board tiles
	*/
	static readBoardWord(word, board) {
		var string = '';
		if (word.startCol === word.endCol) {
			// vertical word
			for (let r = word.startRow; r >= word.endRow; r--) {
				string += board[word.startCol][r];
			}
		} else if (word.startRow === word.endRow) {
			// horizontal word
			for (let c = word.startCol; c <= word.endCol; c++) {
				string += board[c][word.startRow];
			}
		} else {
			// this should never happen!
			console.warn('readBoardWord received a malformed word Object.');
			console.warn('Its start coordinates are (' + word.startCol + ', '
						 + word.startRow + ').');
			console.warn('Its end coordinates are (' + word.endCol + ', '
						 + word.endRow + ').');
		}
		console.debug('readBoardWord returning "' + string + '" when it read from (' + word.startCol + ', ' + word.startRow + ') to (' + word.endCol + ', ' + word.endRow + ').');
		return string;
	}
}

const words = [
	'ABC'
];

export default Words;
