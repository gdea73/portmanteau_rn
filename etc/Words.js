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

class Words {
	isValidWord = (string) => {
		// TODO: implement dictionary (binary search)
		return (string === 'PMT');
	}
	getWordScore = (word, chainLevel) => {
		var score = 0;
		for (let c = 0; c < word.length; c++) {
			c += pointValues[word.charAt(c)];
		}
		score *= lengthMultipliers[chainLevel];
		// TODO: solicit user feedback on square increase
		score *= chainLevel * chainLevel;
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
	readBoardWord = (word, board) => {
		var string = '';
		if (word.startCol === word.endCol) {
			// vertical word
			for (let r = word.startRow; r <= word.endRow; r++) {
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
		return string;
	}
}

export default Words;
