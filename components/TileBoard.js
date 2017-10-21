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

// TODO: remove this testing thing
var t = 0;

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
const TILE_BREAK_ANIM_DURATION = 200;
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
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
                [' ', ' ', ' ', ' ', ' ', ' ', ' '],
			  /* [' ', ' ', ' ', ' ', ' ', ' ', ' '],
			  [' ', ' ', 'S', 'R', 'Q', 'P', 'U'],
			  [' ', ' ', ' ', ' ', ' ', ' ', 'G'],
			  [' ', ' ', ' ', ' ', ' ', ' ', ' '],
			  [' ', ' ', ' ', ' ', ' ', ' ', ' '],
			  [' ', ' ', ' ', 'C', 'G', 'V', 'M'],
			  [' ', ' ', ' ', ' ', ' ', ' ', 'P'], */
            ];
        }
		this.state = {
			cols: cols,	
			dropLetter: Words.getDropLetter(),
		}
		this.firstRender = true;
		this.chainLevel = 0;
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
			this.firstRender = false;
			this.gravAnims = this.initializeGravAnims();
			this.breakAnims = this.initializeBreakAnims();
			this.dropTileGravAnim = new Animated.Value(DROP_TILE_MARGIN);
			this.dropTileAnim = new Animated.Value(this.getColPosX(CENTER_COL));
		}
		console.debug('board at render time:');
		console.debug(this.state.cols);
		return (
			<View style={styles.boardContainer}>
				{this.renderColumns()}
				{this.renderDropTile()}
			</View>
		);
	}

	componentDidUpdate() {
		this.dropTileGravAnim.setValue(DROP_TILE_MARGIN);
		this.dropTileAnim.setValue(this.getColPosX(CENTER_COL));
		this.resetGravAnims();
		this.resetBreakAnims();
		if (this.chainLevel > 0) {
			// we're mid-chain; must return to the breakWordsCallback
			this.breakWordsCallback();
		}
	}

	resetGravAnims() {
		for (let c = 0; c < BOARD_SIZE; c++) {
			for (let r = 0; r < BOARD_SIZE; r++) {
				this.gravAnims[c][r].setValue(this.getTilePosY(r));
			}
		}
	}

	resetBreakAnims() {
		for (let c = 0; c < BOARD_SIZE; c++) {
			for (let r = 0; r < BOARD_SIZE; r++) {
				this.breakAnims[c][r].setValue(1);
			}
		}
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

	initializeBreakAnims() {
		var breakAnims = [[], [], [], [], [], [], []];
		for (let c = 0; c < BOARD_SIZE; c++) {
			for (let r = 0; r < BOARD_SIZE; r++) {
				// this was for shrinking animation breakAnims[c][r] = new Animated.Value(tileSize);
				// currently going to fade out instead, "because ... it's easy" -Bob O
				breakAnims[c][r] = new Animated.Value(1);
			}
		}
		return breakAnims;
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
		// console.debug('rendering tiles [' + col + ']:');
		for (let row = 0; row < BOARD_SIZE; row++) {
			if (this.state.cols[col][row] !== ' ') {
				// the gravity animation, if used, will be triggered by
				// the Board with the proper ending position.
				let stile = {
					backgroundColor: TILE_COLORS[this.state.cols[col][row]],
					top: this.gravAnims[col][row],
					opacity: this.breakAnims[col][row],
					left: 0,
				}
				// console.debug('\t\t[' + this.state.cols[col][row] + ']');
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
		// most importantly, don't allow any drops to occur
		// if we're still mid-chain, and words may still be broken.
		if (this.chainLevel > 0) {
			return;
		}
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
		this.props.incrementMoveCount();
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
				toValue: this.getTilePosY(lowestEmptyRow + 1),
				duration: DROP_TILE_ANIM_Y_DURATION * (lowestEmptyRow + 1),
			}
		));
		this.lastDropCol = col;
		this.lastDropRow = lowestEmptyRow;
		this.chainLevel = 1;
		Animated.sequence(animations).start(this.breakWordsCallback.bind(this));
	}

	breakWordsCallback() {
		// every time the board changes, this function must be called;
		// it checks for any valid words, breaks them, pulls tiles downward as
		// necessary, and repeats the process (at the next chain level).
		var board = this.state.cols.slice();
		console.debug('breakWordsCallback() entered; chainLevel ' + this.chainLevel);
		if (this.chainLevel === 1) {
			// we've just dropped a tile into the board, so we need to add the
			// drop tile to our temporary array of colums while we search.
			board[this.lastDropCol][this.lastDropRow] = this.state.dropLetter;
			console.debug('setting dropCol in tempBoard at (' + this.lastDropCol + ', ' + this.lastDropRow + '): ' + this.state.dropLetter);
		}
		var wordsToCheck = this.getWordsToCheck(board);
		// we now have the complete array of words to look up in the dictionary.
		var validWordsFound = false;
		var breakAnimations = [];
		console.debug('board words we will check:');
		console.debug(wordsToCheck);
		for (let i = 0; i < wordsToCheck.length; i++) {
			var boardWord = wordsToCheck[i];
			var word = Words.readBoardWord(boardWord, board);
			console.debug('board word read: ' + word);
			var word_rev = word.split('').reverse().join('');
			var validWord = undefined;
			if (Words.isValidWord(word)) {
				validWord = word;
			} else if (Words.isValidWord(word_rev)) {
				validWord = word_rev;
			}
			if (validWord) {
				validWordsFound = true;
				// update GameStatus via callbacks to GameScreen
				console.debug('validWord: ' + validWord + '; score: ' + Words.getWordScore(validWord, this.chainLevel) + ' (chain level ' + this.chainLevel + ')');
				this.props.increaseScore(Words.getWordScore(validWord, this.chainLevel));
				this.props.addRecentWord(validWord, this.chainLevel);
				// "break" the word; leave empty space in its board position
				if (boardWord.startCol === boardWord.endCol) {
					// breaking a vertical word
					for (let r = boardWord.startRow; r >= boardWord.endRow; r--) {
						board[boardWord.startCol][r] = ' ';
						breakAnimations.push(
							this.getBreakAnimTiming(boardWord.startCol, r)
						);
					}
				} else if (boardWord.startRow === boardWord.endRow) {
					// breaking a horizontal word
					for (let c = boardWord.startCol; c <= boardWord.endCol; c++) {
						board[c][boardWord.startRow] = ' ';
						breakAnimations.push(
							this.getBreakAnimTiming(c, boardWord.startRow)
						);
					}
				}
			}
		}
		// bring the working 'board' to the class scope, so it can be accessed
		// by the setNextBoardState() callback upon animation completion.
		this.nextBoard = board.slice();
		if (!validWordsFound) {
			// by setting the chain level to zero, we ensure that this callback
			// will not be re-entered upon the next render() after setState().
			this.chainLevel = 0;
			// the chain is over, so we need a new drop letter.
			this.nextDropLetter = Words.getDropLetter();
			this.setNextBoardState();
			return;
		}
		// Beyond this point: words are to be broken, and the break cycle will
		// continue, so long as there are new words to break post-gravity.

		// Prepare the array of gravity animations based on newly-created
		// spaces in the board.
		var gravityAnimations = [];
		for (let c = 0; c < BOARD_SIZE; c++) {
			let fallDist = (board[c][BOARD_SIZE - 1] === ' ') ? 1 : 0;
			// traverse the column from base to peak
			for (let r = BOARD_SIZE - 2; r >= 0; r--) {
				// for each blank we find during the ascent, any tile above
				// the current row will need to fall one more space than the
				// running counter of underlying spaces.
				if (board[c][r] === ' ') {
					fallDist++;
				} else if (fallDist > 0) {
					console.debug('the "' + board[c][r] + '" at c: ' + c + ', r: ' + r + ' will drop by ' + fallDist + ' tiles.');
					gravityAnimations.push(
						this.getGravAnimTiming(c, r, fallDist)
					);
					// reflect the completed fall in nextBoard
					this.nextBoard[c][r + fallDist] = this.nextBoard[c][r];
					// this should be a non-destructive assignment, since we
					// are replacing tiles from base to peak.
					this.nextBoard[c][r] = ' ';
				}
			}
		}
		// Words were found and broken! After refreshing the visual board,
		// this callback shall be called again with chainLevel incremented.
		this.chainLevel++;
		// First, the breaking animations should occur in parallel; the
		// following parallel batch of animations, for gravity, must not
		// begin until the tiles have broken.
		console.debug("About to start break and gravity animations in sequence.");
		console.debug("this.nextBoard:");
		console.debug(this.nextBoard);
		Animated.sequence([
			Animated.parallel(breakAnimations),
			Animated.parallel(gravityAnimations),
		]).start(this.setNextBoardState.bind(this));
	}

	setNextBoardState() {
		// This is called at the end of each breakWordsCallback() execution;
		// if no words were broken, we have set a new drop letter and chainLevel
		// is at zero. At render() time, if chainLevel > 0, breakWordsCallback()
		// is re-entered.
		var newState = this.state;
		newState.cols = this.nextBoard;
		newState.dropLetter = this.nextDropLetter; // only differs at chain ending
		console.debug('about to set new board state with dropLetter ' + newState.dropLetter);
		/* console.debug('cols:');
		console.debug(newState.cols); */
		this.setState(newState);
	}

	getBreakAnimTiming(col, row) {
		return Animated.timing(
			this.breakAnims[col][row], {
				toValue: 0,
				duration: TILE_BREAK_ANIM_DURATION,
				useNativeDriver: false,
			}
		);
	}

	getGravAnimTiming(col, row, fallDist) {
		console.debug('toValue: ' + this.getTilePosY(row + fallDist) + ' (row ' + row + '; fallDist ' + fallDist + ')');
		return Animated.timing(
			this.gravAnims[col][row], {
			toValue: this.getTilePosY(row + fallDist),
			easing: Easing.quad,
			useNativeDriver: false,
		});
	}

	getWordsToCheck(board) {
		var wordsToCheck = [];
		// read the bord for "words," beginning with columns
		for (let c = 0; c < BOARD_SIZE; c++) {
			// only scan if there are at least two tiles in the column
			if (board[c][BOARD_SIZE - 1] !== ' ' &&
				board[c][BOARD_SIZE - 2] !== ' ') {
					var endRow = BOARD_SIZE - 2;
					while (endRow > 0 && board[c][endRow - 1] !== ' ') {
						endRow--;
					}
					// FIXME (possibly) - let or var?
					let word = {
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
							endCol: c - 1,
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
		return row * (tileSize + TILE_PADDING) + TILE_PADDING;
	}

	getColPosX(col) {
		return tileSize * col + (col + 1) * TILE_PADDING;
	}
}

class Tile extends React.Component {
	/* constructor(props) {
		super(props);
		this.state = {
			gravAnim: this.props.gravAnim,
			breakAnim: this.props.breakAnim,	
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
