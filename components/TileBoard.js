import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Easing,
} from 'react-native';

import Constants from '../etc/Constants';
import Words from '../etc/Words';

// logical constants
const {WIDTH, HEIGHT} = require('Dimensions').get('window');
const BOARD_SIZE = 7;
const CENTER_COL = 3;

/* dumb constants from when I thought "unique ID" meant "unique numeric ID."
  
   layer constants are summed with column numbers
   to generate unique View keys for each layer of
   a column; also used to determine transparency.
*/
const COL_BG_LAYER = 100;
const COL_TOUCH_LAYER = 200;

// aesthetic constants
const DROP_TILE_ANIM_X_DURATION = 500;
// TODO: use Y duration as a step / multiplier per distance dropped
const DROP_TILE_ANIM_Y_DURATION = 100;
const DROP_TILE_MARGIN = 2;
const COL_BORDER_RAD = 2;
const TILE_PADDING = 3;
const TILE_FONT_SIZE = 26;

var tileSize, tileBorderRad, scaledStile;

class Board extends React.Component {
	constructor(props) {
		super(props);
		var cols;
		if (this.props.initialCols) {
			cols = this.props.initialCols;
		} else {
			// initialize the board as empty
            cols = [
               /* [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '], */
			  [' ', ' ', ' ', ' ', ' ', ' ', 'M'],
			  [' ', ' ', ' ', ' ', 'X', 'X', 'U'],
			  [' ', ' ', ' ', 'Q', 'Q', 'Q', 'F'],
			  [' ', 'Z', 'G', 'Z', 'Z', 'Z', 'F'],
			  [' ', ' ', 'P', 'P', 'P', 'P', 'E'],
			  ['M', 'M', 'M', 'M', 'M', 'M', 'D'],
			  [' ', ' ', ' ', ' ', ' ', ' ', ' '],
            ];
        }
		this.state = {
			cols: cols,	
			dropLetter: this.getSaneRandomChar(),
		}
		this.firstRender = true;
		this.chainLevel = 0;
	}

	getSaneRandomChar() {
		return String.fromCharCode(Math.floor(65 + Math.random() * 26));
	}

	render() {
		if (this.firstRender) {
			tileSize = (this.props.width - (BOARD_SIZE + 1) * TILE_PADDING)
					   / BOARD_SIZE;
			tileBorderRad = Math.floor(tileSize / 5);
			screenDependentStile = {
				height: tileSize,
				width: tileSize,
				borderRadius: tileBorderRad,
			};
			this.gravAnims = this.initializeGravAnims();
			this.firstRender = false;
		}
		this.dropTileGravAnim = new Animated.Value(DROP_TILE_MARGIN);
		this.dropTileAnim = new Animated.Value(this.getColPosX(CENTER_COL));
		return (
			<View style={styles.boardContainer}>
				{this.renderColumns()}
				{this.renderDropTile()}
			</View>
		);
	}

	initializeGravAnims() {
		// This array holds one Animated.Value for the y-position of each
		// tile *position* in the board (even if unoccupied). When a tile
		// should be dropped due to underlying broken tiles, Board calls
		// Animated.timing() to perform the gravity animation.
		var gravAnims = [[], [], [], [], [], [], []];
		for (let c = 0; c < BOARD_SIZE; c++) {
			for (let r = 0; r < BOARD_SIZE; r++) {
				gravAnims[c][r] = new Animated.Value(this.getTilePosY(r));
			}
		}
		return gravAnims;
	}

	renderDropTile() {
		// the drop tile sits at the very top of the board (no padding)
		// its motion from the center of the board to the chosen drop
		// column is animated by the Board
		var stile = {
			backgroundColor: TILE_COLORS[this.state.dropLetter],
			top: this.dropTileGravAnim,
			left: this.dropTileAnim,
		}
		return(
			<Tile style={stile}
				  letter={this.state.dropLetter} />
		);
	}

	renderColumns() {
		var result = [];
		for (let col = 0; col < BOARD_SIZE; col++) {
			// first, render the views to provide each column's background color
            // second, within these views, render the actual tiles
            let key = COL_BG_LAYER + col;
            result.push(
                    <View key={key}
                        style={this.getColStyle(key)}>
                        {this.renderTiles(col)}
                    </View>
            );
            // last, render the transparent views over the tile area;
			// these handle the touch events.
            key = COL_TOUCH_LAYER + col;
            result.push(
                <View key={key} style={this.getColStyle(key)}
                    onStartShouldSetResponder={() => this.handleColClick(col)}>
                </View>
            );
			 
		}
		return result;
	}

	renderTiles(col) {
		var result = [];
		for (let row = 0; row < BOARD_SIZE; row++) {
			if (this.state.cols[col][row] !== ' ') {
				// the gravity animation, if used, will be triggered by
				// the Board with the proper ending position.
				let stile = {
					backgroundColor: TILE_COLORS[this.state.cols[col][row]],
					top: this.gravAnims[col][row],
					left: 0,
				}
				result.push(
					<Tile key={this.getTileId(col, row)}
						  style={stile}
						  letter={this.state.cols[col][row]} />
				)
			}
		}
		return result;
	}

	getTileId(col, row) {
		return BOARD_SIZE * col + row;
	}

	handleColClick(col) {
		console.debug('handling click on col ' + col);
		// find the lowest empty row in the drop column
		var lowestEmptyRow = -1;
		for (let r = 0; r < BOARD_SIZE; r++) {
			if (this.state.cols[col][r] === ' ') {
				lowestEmptyRow = r;
			}
		}
		if (lowestEmptyRow === -1) {
			// we can't drop into this column
			return;
		}
		this.incrementMoveCount();
		var animations = [];
		if (col != CENTER_COL) {
			// first, animate the shifting to the drop column
			animations.push(Animated.timing(
				this.dropTileAnim, {
					toValue: this.getColPosX(col),
					duration: DROP_TILE_ANIM_X_DURATION,
					easing: Easing.quad,
				}
			));
		}
		animations.push(Animated.timing(
			this.dropTileGravAnim, {
				toValue: this.getTilePosY(lowestEmptyRow + 1) + TILE_PADDING,
				duration: DROP_TILE_ANIM_Y_DURATION * (lowestEmptyRow + 1),
			}
		));
		this.lastDropCol = col;
		this.lastDropRow = lowestEmptyRow;
		this.chainLevel = 1;
		Animated.sequence(animations).start(this.wordBreakerCallback);
	}

	wordBreakerCallback() {
		// every time the board changes, this function must be called;
		// it checks for any valid words, breaks them, pulls tiles downward as
		// necessary, and repeats the process (at the next chain level).
		var board = this.state.cols.slice();
		if (this.chainLevel === 1) {
			// we've just dropped a tile into the board, so we need to add the
			// drop tile to our temporary array of colums while we search.
			board[this.lastDropCol][this.lastDropRow] = this.dropLetter;
		}
		var wordsToCheck = getBoardWords(board);
		// we now have the complete array of words to look up in the dictionary.
		var validWordsFound = false;
		for (let i = 0; i < wordsToCheck.length; i++) {
			var boardWord = wordsToCheck[i];
			var word = Words.readBoardWord(boardWord, board);
			var word_rev = word.split('').reverse().join('');
			var validWord;
			if (Words.isValidWord(word)) {
				validWord = word;
			} else if (Words.isValidWord(word_rev)) {
				validWord = word_rev;
			}
			if (validWord) {
				validWordsFound = true;
				// update GameStatus via callbacks to GameScreen
				this.increaseScore(Words.getWordScore(validWord));
				this.addRecentWord(validWord);
				// "break" the word; leave empty space in its board position
				if (boardWord.startCol === boardWord.endCol) {
					// breaking a vertical word
					for (let r = boardWord.startRow; r <= boardWord.endRow; r++) {
						board[boardWord.startCol][r] = ' ';
					}
				} else if (boardWord.startRow === boardWord.endRow) {
					// breaking a horizontal word
					for (let c = boardWord.startCol; c <= boardWord.endCol; c++) {
						board[c][boardWord.startRow] = ' ';
					}
				}
			}
		}
		if (validWordsFound) {
			// Words were found and broken! After refreshing the visual board,
			// this callback shall be called again with chainLevel incremented.
			this.chainLevel++;
			// TODO: make these animations happen BEFORE we call setState and
			// thereby refresh the entire Board.
			this.breakAndDrop(board);
		} else {
			this.chainLevel = 0;
		}
		var newState = this.state;
		newState.cols = board;
		this.setState(newState);
	}

	breakAndDrop(board) {
		// TODO: compare 'board' to this.state.cols;
		// note differences;
		// animate the breaking of any newly-missing tiles;
		// figure out which tiles will be affected by gravity;
		// make gravity happen (from an animation standpoint);
		// make gravity happen (on the back end, to the parameter board object);
		return board;
	}

	getWordsToCheck(board) {
		var wordsToCheck = [];
		// read the bord for "words," beginning with columns
		for (let c = 0; c < BOARD_SIZE; c++) {
			// only scan if there are at least two tiles in the column
			if (board[c][BOARD_SIZE - 1] !== ' ' &&
				board[c][BOARD_SIZE - 2] !== ' ') {
					var endRow = BOARD_SIZE - 3;
					while (endRow > 0 && board[c][endRow - 1] !== ' ') {
						endRow--;
					}
					// FIXME (possibly) - let or var?
					var word = {
						startCol: c,
						endCol: c,
						startRow: BOARD_SIZE - 1,
						endRow: endRow
					};
					wordsToCheck.push(word);
			}
		}
		// scan for horizontal (contiguous) "words"
		for (let r = 0; r < BOARD_SIZE; r++) {
			var inWord = false;
			var startCol;
			for (let c = 0; c < BOARD_SIZE; c++) {
				if (!inWord && board[c][r] !== ' ') {
					inWord = true;
					startCol = c;
				} else if (inWord) {
					if (board[c][r] === ' ') {
						// the word has ended; mark its end column as (c - 1)
						inWord = false;
						var word = {
							startCol: startCol,
							endCol: c - 1
							startRow: r,
							endRow: r
						};
						wordsToCheck.push(word);
					} else if (c == BOARD_SIZE - 1) {
						// the word intersects the board X-boundary
						inWord = false;
						var word = {
							startCol: startCol,
							endCol: BOARD_SIZE - 1, // or, c
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

    getColStyle(columnKey) {
        var bgColor = 'transparent';
        var index = columnKey % 100;
        var layer = Math.floor(columnKey / 100) * 100;
        var borderR = 0;
        if (layer === COL_BG_LAYER) {
            bgColor = '#' + index + index + index + index + index + index;
            borderR = COL_BORDER_RAD;
        }
        return {
            flex: 0,
            position: 'absolute',
            top: TILE_PADDING + tileSize,
            left: this.getColPosX(index),
            backgroundColor: bgColor,
            width: tileSize,
            height: tileSize * BOARD_SIZE + TILE_PADDING * (BOARD_SIZE + 2),
            borderRadius: borderR,
            // TODO: test this properly
            overflow: 'scroll',
        }
	}

	// Translation methods from board coordinates to absolute coordinates.
	getTilePosY(row) {
		return row * tileSize + TILE_PADDING;
	}

	getColPosX(col) {
		return tileSize * col + (col + 1) * TILE_PADDING;
	}
}

class Tile extends React.Component {
	/* constructor(props) {
		super(props);
		var gravAnim = new Animated.Value(this.props.style['top']),
		this.state = {
			gravAnim: gravAnim,

		}
	} */

	render() {
		return(
			<Animated.View style={[styles.defaultStile,
					              screenDependentStile, this.props.style]}>
				<Text style={styles.tileText}>{this.props.letter}</Text>
			</Animated.View>
		);
	}
}

const styles = StyleSheet.create({
    boardContainer: {
        flex: 1,
        backgroundColor: '#bbdfef',
        borderRadius: Constants.defaultBorderRad,
    },  

    dropTileContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#126424',
        height: tileSize,
    },  

	defaultStile: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'black',
	},

	tileText: {
		fontSize: TILE_FONT_SIZE,
		backgroundColor: 'transparent',
		color: 'white',
	},
});

const TILE_COLORS = { 
    'A': '#c2efcb',
    'B': '#29d40e',
    'C': '#b3dc31',
    'D': '#6e6c81',
    'E': '#6da7c6',
    'F': '#ffdc33',
    'G': '#e6379f',
    'H': '#9bb04f',
    'I': '#515311',
    'J': '#fa0c8b',
    'K': '#7a094f',
    'L': '#34f978',
    'M': '#2b18a8',
    'N': '#58b76b',
    'O': '#0c4c6b',
    'P': '#4870ba',
    'Q': '#661f4d',
    'R': '#7fc737',
    'S': '#8b36d9',
    'T': '#71e385',
    'U': '#fd6831',
    'V': '#25b113',
    'W': '#98daf6',
    'X': '#507248',
    'Y': '#b34882',
    'Z': '#db482b',
    'BLANK': '#ffffff',
    'NONE': 'transparent',
};

export default Board;