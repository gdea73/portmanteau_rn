import Constants from './Constants';
require('./Dictionary.js');

var RNFS = require('react-native-fs');

const CHAR_TABLE_SIZE = 202;

const quantities = {
    A: 9,
	B: 2,
	C: 2,
	D: 4,
	E: 12,
	F: 2,
	G: 3,
	H: 2,
	I: 9,
	J: 1,
	K: 1,
	L: 4,
	M: 2,
    N: 6,
	O: 8,
	P: 2,
	Q: 1,
	R: 6,
	S: 4,
	T: 6,
	U: 4,
	V: 2,
	W: 2,
	X: 1,
	Y: 2,
	Z: 1
};

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
	0, // 								 	  ... or 1, for that matter
	0,
	9, // currently MIN_WORD_LENGTH
	23,
	49,
	73,
	256
];

var dictLoaded = false;
var dictionary = [];
var charTableLoaded = false;
var charTable = [];
var tileSet = [];

function initCharTable() {
	for (let letter in quantities) {
		for (let i = 0; i < quantities[letter]; i++) {
			charTable.push(letter);
		}
	}
	console.debug('number of blanks: ' + CHAR_TABLE_SIZE - charTable.length);
	for (let j = charTable.length; j < CHAR_TABLE_SIZE; j++) {
		// pad the rest of the char table with BLANKS.
		charTable.push(' ');
	}
}
function generateTileSet() {
	tileSet = charTable.slice();
	let i = 0, j = 0, temp = null;
	for (i = tileSet.length - 1; i > 0; i--) {
		// shuffle the char table and retrieve tiles in order
		j = Math.floor(Math.random() * (i + 1));
		temp = tileSet[i];
		tileSet[i] = tileSet[j];
		tileSet[j] = temp;
	}
}
function binSearch(string, start, end) {
	if (start === end) {
		// as close as it gets
		return !!(string === words[end]);
	}
	var midpt = Math.floor((start + end) / 2);
	if (string < dictionary[midpt]) {
		return binSearch(string, start, midpt);
	}
	if (string > dictionary[midpt]) {
		return binSearch(string, midpt + 1, end);
	}
	// if reached, we must have found the string
	// console.debug('end of binsearch reached, string is ' + string + '; midpt of dict here is ' + dictionary[midpt]);
	return !!(string === dictionary[midpt]);
}

class Words {
	static getDropLetter(moves) {
		if (!charTableLoaded) {
			initCharTable();
			charTableLoaded = true;
		}
		if (moves % CHAR_TABLE_SIZE == 0) {
			// we've exhausted the char table; generate a new set of drop tiles
			generateTileSet();
		}
		return tileSet[moves % CHAR_TABLE_SIZE];
	}


	static loadDictionary(callback) {
		console.debug('attempting to load dictionary from bundle...');
		dictionary = DICT_STRING.split(/\n/g);
		callback();
	}

	static isValidWord(string) {
		if (string.length < Constants.MIN_WORD_LENGTH) {
			return false;
		}
		return binSearch(string, 0, dictionary.length);
	}

	static getWordScore(word, chainLevel) {
		var score = 0;
		for (let c = 0; c < word.length; c++) {
			score += pointValues[word.charAt(c)];
		}
		score *= lengthMultipliers[word.length];
		score *= chainLevel * chainLevel * chainLevel;
		// easter eggs
		if (word === 'MUFFED') {
			score *= 73;
		} else if (word === 'GHIA') {
			score *= 71;
		}
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

	static getWordsToCheck(board) {
        var wordsToCheck = [];
        // read the bord for "words," beginning with columns
        for (let c = 0; c < Constants.BOARD_SIZE; c++) {
            // only scan if there are at least two tiles in the column
            if (board[c][Constants.BOARD_SIZE - 1] !== ' ' &&
                board[c][Constants.BOARD_SIZE - 2] !== ' ') {
                    var endRow = Constants.BOARD_SIZE - 2;
                    while (endRow > 0 && board[c][endRow - 1] !== ' ') {
                        endRow--;
                    }
                    let word = {
                        startCol: c,
                        endCol: c,
                        startRow: Constants.BOARD_SIZE - 1,
                        endRow: endRow
                    };
                    wordsToCheck.push(word);
            }
        }
        // scan for horizontal (contiguous) "words"
        for (let r = 0; r < Constants.BOARD_SIZE; r++) {
            var inWord = false;
            var startCol;
            for (let c = 0; c < Constants.BOARD_SIZE; c++) {
                if (!inWord && board[c][r] !== ' ') {
                    inWord = true;
                    startCol = c;
                } else if (inWord) {
                    if (board[c][r] === ' ') {
                        // the word has ended; mark its end column as (c - 1)
                        inWord = false;
                        var word = {
                            startCol: startCol,
                            endCol: c - 1,
                            startRow: r,
                            endRow: r
                        };
                        wordsToCheck.push(word);
                    } else if (c == Constants.BOARD_SIZE - 1) {
                        // the word intersects the board X-boundary
                        inWord = false;
                        var word = {
                            startCol: startCol,
                            endCol: Constants.BOARD_SIZE - 1, // or, c
                            startRow: r,
                            endRow: r
                       };
                        wordsToCheck.push(word);
                    } // else, continue scanning the word
                }
            }
        }
        return wordsToCheck;
    }

}

const words = [
	'ABC'
];

export default Words;
