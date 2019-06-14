import React from 'react';
import {
	Platform,
	View,
	ScrollView,
	Text,
	StyleSheet,
	TouchableOpacity,
	Animated,
	Easing,
} from 'react-native';

import Constants from '../etc/Constants';
import Words from '../etc/Words';
import Tile from './Tile';

// logical constants
const {WIDTH, HEIGHT} = require('Dimensions').get('window');
const CENTER_COL = 3;

/* dumb constants from when I thought "unique ID" meant "unique numeric ID."

   layer constants are summed with column numbers
   to generate unique View keys for each layer of
   a column; also used to determine transparency.
*/
const COL_BG_LAYER = 100;
const COL_TOUCH_LAYER = 200;

// timing-related constants
const DROP_TILE_ANIM_X_DURATION = 200;
const DROP_TILE_ANIM_Y_DURATION = 80;
const TILE_BREAK_ANIM_DURATION = 200;
const CHAIN_DELAY = 700;
const SUPER_BLANK_REPLACE_DELAY = 500;

// aesthetic constants
const DROP_TILE_MARGIN = 2;
const COL_BORDER_RAD = 2;

const MESSAGE_FONT_RATIO = 0.3;

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
            ];
        }
		var dropLetter = this.props.initialDropLetter
					   || Words.getDropLetter(this.props.getMoveCount());
		this.state = {
			cols: cols,
			dropLetter: dropLetter,
		}
		this.firstRender = true;
		this.chainLevel = 0;
	}

	render() {
		if (this.firstRender) {
			Tile.tile_size = (this.props.width - (Constants.BOARD_SIZE + 1) * Constants.TILE_PADDING)
					   / Constants.BOARD_SIZE;
			this.messageFontSize = Tile.tile_size * MESSAGE_FONT_RATIO;
			this.firstRender = false;
			this.gravAnims = this.initializeGravAnims();
			this.breakAnims = this.initializeBreakAnims();
			this.dropTileGravAnim = new Animated.Value(DROP_TILE_MARGIN);
			this.dropTileAnim = new Animated.Value(this.getColPosX(CENTER_COL));
		}
		Constants.d('board at render time:');
		Constants.d(this.state.cols);
		var message = undefined;
		if (this.state.superBlank) {
			if (this.state.superBlankSelectionID) {
				message = 'Choose the new letter for the selected tile.';
			} else {
				message = 'Select any letter on the board to edit.';
			}
		} else if (!this.state.superBlank && this.state.dropLetter == ' ') {
			message = 'Choose any letter to drop into the board.';
		}
		return (
			<View style={[styles.boardContainer, {width: this.props.width}]}>
				{this.renderColumns()}
				{message && this.renderMessage(message)}
				{this.state.dropLetter == null
					|| (
						this.state.superBlank
						&& !this.state.superBlankSelectionID
				  ) || this.renderDropTile()}
			</View>
		);
	}

	renderMessage = (message) => {
		return(
			<View style={[
				styles.messageContainer,
				{ top: Tile.tile_size + 2 * Constants.TILE_PADDING },
			]}>
				<Text style={styles.messageText}>{message}</Text>
			</View>
		);
	}

	isGameOver() {
		for (let c = 0; c < Constants.BOARD_SIZE; c++) {
			for (let r = 0; r < Constants.BOARD_SIZE; r++) {
				if (this.state.cols[c][r] === ' ') {
					return false;
				}
			}
		}
		return true;
	}

	tileCount = (nextBoard) => {
		var tileCount = 0;
		for (let c = 0; c < Constants.BOARD_SIZE; c++) {
			for (let r = 0; r < Constants.BOARD_SIZE; r++) {
				if (nextBoard[c][r] !== ' ') {
					tileCount++;
				}
			}
		}
		return tileCount;
	}

	componentDidMount() {
		if (this.props.onRef) {
			this.props.onRef(this);
		}
	}

	componentDidUpdate() {
		if (this.isGameOver() && this.props.gameOver) {
			this.props.gameOver();
			return;
		}
		this.dropTileGravAnim.setValue(DROP_TILE_MARGIN);
		this.dropTileAnim.setValue(this.getColPosX(CENTER_COL));
		this.resetGravAnims();
		this.resetBreakAnims();
		if (this.chainLevel > 0) {
			// we're mid-chain; must return to the breakWordsCallback
			if (this.chainLevel > 1) {
				// (after a brief delay to allow the user to process the chain)
				this.timer = setTimeout(() => {
						this.breakWordsCallback()
				}, CHAIN_DELAY);
			} else if (this.superBlankDelay) {
				// (new: delay after user edits a tile before words are broken)
				this.superBlankDelay = false;
				this.timer = setTimeout(() => {
						this.breakWordsCallback()
				}, SUPER_BLANK_REPLACE_DELAY);
			} else {
				this.breakWordsCallback();
			}
		}
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
		if (this.props.onRef) {
			this.props.onRef(undefined);
		}
	}

	resetGravAnims() {
		for (let c = 0; c < Constants.BOARD_SIZE; c++) {
			for (let r = 0; r < Constants.BOARD_SIZE; r++) {
				this.gravAnims[c][r].setValue(this.getTilePosY(r));
			}
		}
	}

	resetBreakAnims() {
		for (let c = 0; c < Constants.BOARD_SIZE; c++) {
			for (let r = 0; r < Constants.BOARD_SIZE; r++) {
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
		for (let c = 0; c < Constants.BOARD_SIZE; c++) {
			for (let r = 0; r < Constants.BOARD_SIZE; r++) {
				gravAnims[c][r] = new Animated.Value(this.getTilePosY(r));
			}
		}
		return gravAnims;
	}

	initializeBreakAnims() {
		var breakAnims = [[], [], [], [], [], [], []];
		for (let c = 0; c < Constants.BOARD_SIZE; c++) {
			for (let r = 0; r < Constants.BOARD_SIZE; r++) {
				// this was for shrinking animation breakAnims[c][r] = new Animated.Value(Tile.tile_size);
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
			backgroundColor: Constants.TILE_COLORS[this.state.dropLetter],
			top: this.dropTileGravAnim,
			left: this.dropTileAnim,
		}
		if (this.state.dropLetter === ' ') {
			// the drop tile is a blank -- prompt the user to assign it a letter
			// and then re-render the board with the newly-chosen drop tile.
			return (
				<View style={styles.tilePickerOuterView}>
					<ScrollView
						contentContainerStyle={[
							styles.tilePickerInnerView,
							{height: Tile.tile_size + Constants.TILE_PADDING}
						]}
						horizontal={true}
					>
						{this.getTilePickerTiles()}
					</ScrollView>
				</View>
			);
		} else {
			return(
				<Tile style={stile} letter={this.state.dropLetter} />
			);
		}
	}

	getTilePickerTiles() {
		var result = [];
		for (let i = 0; i < 26; i++) {
			let letter = String.fromCharCode(65 + i);
			var stile = {
				backgroundColor: Constants.TILE_COLORS[letter],
				position: 'relative',
				flex: 1,
				height: Tile.tile_size,
				width: Tile.tile_size,
				marginRight: Constants.TILE_PADDING / 2,
			}
			let onPress = () => {
				Constants.d('assigning blank to ' + letter);
				this.nextDropLetter = letter;
				this.nextBoard = this.state.cols.slice();
				this.setNextBoardState();
			}
			if (this.state.superBlank) {
				let tileID = this.state.superBlankSelectionID;
				onPress = () => {
					Constants.d('replacing tile ID ' + tileID + ' with ' + letter);
					this.nextBoard[Math.floor(tileID / Constants.BOARD_SIZE)]
								  [tileID % Constants.BOARD_SIZE] = letter;
					// consider the replacement a move
					this.props.incrementMoveCount();
					// generate a new drop letter
					this.nextDropLetter = Words.getDropLetter(
						this.props.getMoveCount()
					);
					// check for words after the replacement
					this.chainLevel = 1;
					this.superBlankDelay = true;
					this.setNextBoardState()
				}
			}
			result.push(
				<TouchableOpacity onPress={onPress}
					  key={this.getTileID(Constants.BOARD_SIZE + 1, i)}
				>
					<Tile style={stile} letter={letter}
						  key={this.getTileID(Constants.BOARD_SIZE + 2, i)}
					/>
				</TouchableOpacity>
			);
		}
		return result;
	}

	renderColumns() {
		var result = [];
		for (let col = 0; col < Constants.BOARD_SIZE; col++) {
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
			if (!this.state.superBlank) {
				result.push(
					<View key={key} style={this.getColStyle(key)}
						onStartShouldSetResponder={() => this.handleColClick(col)}>
					</View>
				);
			}
		}
		return result;
	}

	superBlankSelect = (tileID) => {
		var state = this.state;
		state.superBlankSelectionID = tileID;
		this.setState(state);
	}

	renderTiles(col) {
		var result = [];
		for (let row = 0; row < Constants.BOARD_SIZE; row++) {
			if (this.state.cols[col][row] !== ' ') {
				// the gravity animation, if used, will be triggered by
				// the Board with the proper ending position.
				let backgroundColor = Constants.TILE_COLORS[this.state.cols[col][row]];
				// tiles only receive touch events during super blank selection
				let onSelect = undefined;
				if (this.state.superBlank) {
					backgroundColor = Constants.TILE_UNSELECTED_COLOR;
					if (this.state.superBlankSelectionID) {
						// a selection has been made
						if (this.state.superBlankSelectionID
							== this.getTileID(col, row)) {
							// this is the selected tile; color it accordingly
							backgroundColor = Constants.TILE_SELECTED_COLOR;
						}
					} else {
						// no selection has been made; generate onSelect
						onSelect = () => {
							this.superBlankSelect(this.getTileID(col, row));
						}
					}
				}
				let stile = {
					backgroundColor: backgroundColor,
					top: this.gravAnims[col][row],
					opacity: this.breakAnims[col][row],
					left: 0,
				}
				result.push(
					<Tile key={this.getTileID(col, row)}
						  style={stile}
						  letter={this.state.cols[col][row]}
						  onSelect={onSelect}
					/>
				)
			}
		}
		return result;
	}

	getTileID(col, row) {
		return Constants.BOARD_SIZE * col + row;
	}

	handleColClick(col) {
		Constants.d('handling click on col ' + col);
		// Most importantly, don't allow any drops to occur
		// if we're still mid-chain, and words may still be broken.
		// Also, if we haven't assigned a letter to a blank drop tile, bail.
		if (this.chainLevel > 0 || this.state.superBlank
			|| this.state.dropLetter === ' ') {
			return;
		}
		var lowestEmptyRow = -1;
		for (let r = 0; r < Constants.BOARD_SIZE; r++) {
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

		// The following code was moved from breakWordsCallback in an attempt
		// to address the issue of the drop tile's missing break animation.
		var board = this.state.cols.slice();
		// we've just dropped a tile into the board, so we need to add the
		// drop tile to our temporary array of colums while we search.
		board[this.lastDropCol][this.lastDropRow] = this.state.dropLetter;
		Constants.d('setting dropCol in nextBoard at (' + this.lastDropCol + ', ' + this.lastDropRow + '): ' + this.state.dropLetter);
		this.nextBoard = board;
		this.nextDropLetter = null;
		Animated.sequence(animations).start(this.setNextBoardState.bind(this));
	}

	breakWordsCallback() {
		// every time the board changes, this function must be called;
		// it checks for any valid words, breaks them, pulls tiles downward as
		// necessary, and repeats the process (at the next chain level).
		var board = this.state.cols.slice();
		Constants.d('breakWordsCallback() entered; chainLevel ' + this.chainLevel);
		var wordsToCheck = Words.getWordsToCheck(board);
		// we now have the complete array of words to look up in the dictionary.
		var validWordsFound = false;
		var breakAnimations = [];
		// bring the working 'board' to the class scope, so it can be accessed
		// by the setNextBoardState() callback upon animation completion.
		this.nextBoard = [];
		for (let boardCol = 0; boardCol < Constants.BOARD_SIZE; boardCol++) {
			this.nextBoard.push(board[boardCol].slice());
		}
		for (let i = 0; i < wordsToCheck.length; i++) {
			var boardWord = wordsToCheck[i];
			// it's important that we do not read words from 'nextBoard'
			var word = Words.readBoardWord(boardWord, board);
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
				this.props.increaseScore(
					Words.getWordScore(validWord, this.chainLevel)
						* this.props.getLevel(),
					this.chainLevel
				);
				this.props.addTilesBrokenCount(validWord.length);
				this.props.incrementWordsBrokenCount();
				this.chainLevel++
				this.props.addRecentWord(validWord, this.chainLevel);
				// "break" the word; leave empty space in its board position
				if (boardWord.startCol === boardWord.endCol) {
					// breaking a vertical word
					for (let r = boardWord.startRow; r >= boardWord.endRow; r--) {
						this.nextBoard[boardWord.startCol][r] = ' ';
						breakAnimations.push(
							this.getBreakAnimTiming(boardWord.startCol, r)
						);
					}
				} else if (boardWord.startRow === boardWord.endRow) {
					// breaking a horizontal word
					for (let c = boardWord.startCol; c <= boardWord.endCol; c++) {
						this.nextBoard[c][boardWord.startRow] = ' ';
						breakAnimations.push(
							this.getBreakAnimTiming(c, boardWord.startRow)
						);
					}
				}
			}
		}
		if (!validWordsFound) {
			// by setting the chain level to zero, we ensure that this callback
			// will not be re-entered upon the next render() after setState().
			this.chainLevel = 0;
			// the chain is over, so we need a new drop letter.
			this.nextDropLetter = Words.getDropLetter(this.props.getMoveCount());
			this.setNextBoardState();
			return;
		}
		// Beyond this point: words are to be broken, and the break cycle will
		// continue, so long as there are new words to break post-gravity.
		this.nextDropLetter = this.state.dropLetter;
		// Prepare the array of gravity animations based on newly-created
		// spaces in the board.
		var gravityAnimations = [];
		for (let c = 0; c < Constants.BOARD_SIZE; c++) {
			let fallDist = (this.nextBoard[c][Constants.BOARD_SIZE - 1] === ' ') ? 1 : 0;
			// traverse the column from base to peak
			for (let r = Constants.BOARD_SIZE - 2; r >= 0; r--) {
				// for each blank we find during the ascent, any tile above
				// the current row will need to fall one more space than the
				// running counter of underlying spaces.
				if (this.nextBoard[c][r] === ' ') {
					fallDist++;
				} else if (fallDist > 0) {
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
		/* now incremented per-word within each call of this function this.chainLevel++; */
		// First, the breaking animations should occur in parallel; the
		// following parallel batch of animations, for gravity, must not
		// begin until the tiles have broken.
		Constants.d("this.nextBoard:");
		Constants.d(this.nextBoard);
		Animated.sequence([
			Animated.parallel(breakAnimations, {stopTogether: false}),
			Animated.parallel(gravityAnimations, {stopTogether: false}),
		]).start(this.setNextBoardState.bind(this));
	}

	// probability of a super blank is given as a function of the number of
	// tiles on the board
	getSuperBlankProbability = () => {
		var tilesOnBoard = 0;
		for (let c = 0; c < Constants.BOARD_SIZE; c++) {
			for (let r = 0; r < Constants.BOARD_SIZE; r++) {
				if (this.state.cols[c][r] !== ' ') {
					tilesOnBoard++;
				}
			}
		}
		if (tilesOnBoard < 20) {
			return 0.0;
		}
		if (tilesOnBoard > 42) {
			return 1.0;
		}
		return 2 * tilesOnBoard / 100.0;
	}

	setNextBoardState() {
		// This is called at the end of each breakWordsCallback() execution;
		// if no words were broken, we have set a new drop letter and chainLevel
		// is at zero. At render() time, if chainLevel > 0, breakWordsCallback()
		// is re-entered.
		var newState = this.state;
		newState.cols = this.nextBoard;
		newState.dropLetter = this.nextDropLetter; // only differs at chain ending
		// reset super blank selection
		newState.superBlankSelectionID = undefined;
		if (newState.dropLetter === ' '
			&& Math.random() < this.getSuperBlankProbability()
			&& this.tileCount(newState.cols) >= Constants.MIN_WORD_LENGTH) {
			newState.superBlank = true;
		} else {
			newState.superBlank = false;
		}
		Constants.d('about to set new board state with dropLetter ' + newState.dropLetter);
		this.setState(newState);
	}

	getBreakAnimTiming(col, row) {
		return Animated.timing(
			this.breakAnims[col][row], {
				toValue: 0,
				duration: TILE_BREAK_ANIM_DURATION,
				useNativeDriver: false, // TODO: investigate if this is supported on Android now
			}
		);
	}

	getGravAnimTiming(col, row, fallDist) {
		return Animated.timing(
			this.gravAnims[col][row], {
			toValue: this.getTilePosY(row + fallDist),
			easing: Easing.quad,
			useNativeDriver: false, // TODO: investigate if this is supported on Android now
		});
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
            top: Constants.TILE_PADDING + Tile.tile_size,
            left: this.getColPosX(index),
            backgroundColor: bgColor,
            width: Tile.tile_size,
            height: Tile.tile_size * Constants.BOARD_SIZE + Constants.TILE_PADDING * (Constants.BOARD_SIZE + 1),
            borderRadius: borderR,
            // TODO: test this properly
            overflow: 'scroll',
        }
	}

	// Translation methods from board coordinates to absolute coordinates.
	getTilePosY(row) {
		return row * (Tile.tile_size + Constants.TILE_PADDING) + Constants.TILE_PADDING;
	}

	getColPosX(col) {
		return Tile.tile_size * col + (col + 1) * Constants.TILE_PADDING;
	}
}

const styles = StyleSheet.create({
    boardContainer: {
        flex: 1,
    },
	messageContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		backgroundColor: '#5AE27073',
		justifyContent: 'center',
	},
	messageText: {
		color: 'white',
		fontSize: this.messageFontSize,
		textAlign: 'center',
		textShadowColor: 'black',
		textShadowOffset: {width: -0.75, height: 1},
	},
	tilePickerOuterView: {
		position: 'absolute',
		top: Constants.TILE_PADDING / 2,
		left: Constants.TILE_PADDING,
		right: Constants.TILE_PADDING,
		backgroundColor: 'transparent',
	},
	tilePickerInnerView: {
		flexDirection: 'row',
	},
});

export default Board;
//FIXME: decouple Tile so I can import it separately in DictionaryScreen. I
//don't need any of the board shit and it's all broken in its current state. If
//Tile is a separate class (AND FILE), then they can be used board-less for the
//dictionary tabs and word score displays.
