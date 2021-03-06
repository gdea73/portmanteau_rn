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
const TILE_PADDING = 3;
const TILE_FONT_RATIO = 0.45;
const SUPER_BLANK_TILE_UNSELECTED_COLOR = '#222222';
const SUPER_BLANK_TILE_SELECTED_COLOR = '#AAAA00';

const MESSAGE_FONT_RATIO = 0.3;

// global vars shared with Tile component
var tileSize, tileFontSize, tileBorderRad, scaledStile, messageFontSize;

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
			tileSize = (this.props.width - (Constants.BOARD_SIZE + 1) * TILE_PADDING)
					   / Constants.BOARD_SIZE;
			tileBorderRad = Math.floor(tileSize / 5);
			screenDependentStile = {
				height: tileSize,
				width: tileSize,
				borderRadius: tileBorderRad,
			};
			tileFontSize = tileSize * TILE_FONT_RATIO;
			messageFontSize = tileSize * MESSAGE_FONT_RATIO;
			console.debug('tile size: ' + tileSize + '; tile font size: ' + tileFontSize);
			this.firstRender = false;
			this.gravAnims = this.initializeGravAnims();
			this.breakAnims = this.initializeBreakAnims();
			this.dropTileGravAnim = new Animated.Value(DROP_TILE_MARGIN);
			this.dropTileAnim = new Animated.Value(this.getColPosX(CENTER_COL));
		}
		console.debug('board at render time:');
		console.debug(this.state.cols);
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
				{ top: tileSize + 2 * TILE_PADDING },
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
		if (this.state.dropLetter === ' ') {
			// the drop tile is a blank -- prompt the user to assign it a letter
			// and then re-render the board with the newly-chosen drop tile.
			return (
				<View style={styles.tilePickerOuterView}>
					<ScrollView
						contentContainerStyle={[
							styles.tilePickerInnerView,
							{height: tileSize + TILE_PADDING}
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
				backgroundColor: TILE_COLORS[letter],
				position: 'relative',
				flex: 1,
				height: tileSize,
				width: tileSize,
				marginRight: TILE_PADDING / 2,
			}
			let onPress = () => {
				console.debug('assigning blank to ' + letter);
				this.nextDropLetter = letter;
				this.nextBoard = this.state.cols.slice();
				this.setNextBoardState();
			}
			if (this.state.superBlank) {
				let tileID = this.state.superBlankSelectionID;
				onPress = () => {
					console.debug('replacing tile ID ' + tileID + ' with ' + letter);
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
		// console.debug('rendering tiles [' + col + ']:');
		for (let row = 0; row < Constants.BOARD_SIZE; row++) {
			if (this.state.cols[col][row] !== ' ') {
				// the gravity animation, if used, will be triggered by
				// the Board with the proper ending position.
				let backgroundColor = TILE_COLORS[this.state.cols[col][row]];
				// tiles only receive touch events during super blank selection
				let onSelect = undefined;
				if (this.state.superBlank) {
					backgroundColor = SUPER_BLANK_TILE_UNSELECTED_COLOR;
					if (this.state.superBlankSelectionID) {
						// a selection has been made
						if (this.state.superBlankSelectionID
							== this.getTileID(col, row)) {
							// this is the selected tile; color it accordingly
							backgroundColor = SUPER_BLANK_TILE_SELECTED_COLOR;
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
				// console.debug('\t\t[' + this.state.cols[col][row] + ']');
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
		console.debug('handling click on col ' + col);
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
		console.debug('setting dropCol in nextBoard at (' + this.lastDropCol + ', ' + this.lastDropRow + '): ' + this.state.dropLetter);
		this.nextBoard = board;
		this.nextDropLetter = null;
		Animated.sequence(animations).start(this.setNextBoardState.bind(this));
	}

	breakWordsCallback() {
		// every time the board changes, this function must be called;
		// it checks for any valid words, breaks them, pulls tiles downward as
		// necessary, and repeats the process (at the next chain level).
		var board = this.state.cols.slice();
		console.debug('breakWordsCallback() entered; chainLevel ' + this.chainLevel);
		var wordsToCheck = Words.getWordsToCheck(board);
		// we now have the complete array of words to look up in the dictionary.
		var validWordsFound = false;
		var breakAnimations = [];
		console.debug('board words we will check:');
		console.debug(wordsToCheck);
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
				console.debug('validWord: ' + validWord + '; score: ' + Words.getWordScore(validWord, this.chainLevel) + ' (chain level ' + this.chainLevel + ')');
				this.props.increaseScore(
					Words.getWordScore(validWord, this.chainLevel)
						* this.props.getLevel(),
					this.chainLevel
				);
				console.debug('*** broke ' + validWord.length + ' tiles');
				this.props.addTilesBrokenCount(validWord.length);
				this.props.incrementWordsBrokenCount();
				this.chainLevel++
				this.props.addRecentWord(validWord, this.chainLevel);
				// "break" the word; leave empty space in its board position
				if (boardWord.startCol === boardWord.endCol) {
					// breaking a vertical word
					for (let r = boardWord.startRow; r >= boardWord.endRow; r--) {
						this.nextBoard[boardWord.startCol][r] = ' ';
						console.debug('adding break animation for (' +
							boardWord.startCol + ', ' + r + ').');
						breakAnimations.push(
							this.getBreakAnimTiming(boardWord.startCol, r)
						);
						
					}
				} else if (boardWord.startRow === boardWord.endRow) {
					// breaking a horizontal word
					for (let c = boardWord.startCol; c <= boardWord.endCol; c++) {
						this.nextBoard[c][boardWord.startRow] = ' ';
						console.debug('adding break animation for (' +
							c + ', ' + boardWord.startCol + ').');
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
		/* now incremented per-word within each call of this function this.chainLevel++; */
		// First, the breaking animations should occur in parallel; the
		// following parallel batch of animations, for gravity, must not
		// begin until the tiles have broken.
		console.debug("About to start break and gravity animations in sequence.");
		console.debug("this.nextBoard:");
		console.debug(this.nextBoard);
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
			console.debug('SUPER BLANK');
			newState.superBlank = true;
		} else {
			newState.superBlank = false;
		}
		console.debug('about to set new board state with dropLetter ' + newState.dropLetter);
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
            height: tileSize * Constants.BOARD_SIZE + TILE_PADDING * (Constants.BOARD_SIZE + 1),
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
	render() {
		var absurdityRatio = 1.8;
		var fontOffset = (1 - TILE_FONT_RATIO) / absurdityRatio * tileSize;
		var textStyle = [styles.tileText, {
			fontSize: tileFontSize,
			width: tileSize,
		}];
		if (Platform.OS == 'ios') {
			textStyle.push({
				position: 'absolute',
				top: fontOffset,
			});
		}
		return(
			<Animated.View style={[styles.defaultStile,
					              screenDependentStile, this.props.style]}
						   onStartShouldSetResponder=
						   		{this.props.onSelect}>
										<Text style={textStyle}>
											{this.props.letter}
										</Text>
			</Animated.View>
		);
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
		fontSize: messageFontSize,
		textAlign: 'center',
		textShadowColor: 'black',
		textShadowOffset: {width: -0.75, height: 1},
	},
	defaultStile: {
		position: 'absolute',
		borderWidth: 1,
		borderColor: 'black',
		justifyContent: 'center',
	},
	tileText: {
		fontFamily: Constants.LEAGUE_SPARTAN,
		backgroundColor: 'transparent',
		color: 'white',
		textShadowColor: 'black',
		textShadowOffset: {width: -1.5, height: 2},
		alignSelf: 'center',
		textAlign: 'center',
	},
	tilePickerOuterView: {
		position: 'absolute',
		top: TILE_PADDING / 2,
		left: TILE_PADDING,
		right: TILE_PADDING,
		backgroundColor: 'transparent',
	},
	tilePickerInnerView: {
		flexDirection: 'row',
	},
	tileTextContainer: {
		flex: 1,
		backgroundColor: '#000',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

const TILE_COLORS = {
    'A': '#5AE270',
    'B': '#5AC3E2',
    'C': '#F45F62',
    'D': '#4940FF',
    'E': '#EE35F0',
    'F': '#9E2680',
    'G': '#40FFE6',
    'H': '#A55FF4',
    'I': '#84F035',
    'J': '#4F0D4B',
    'K': '#3E7386',
    'L': '#C060FF',
    'M': '#F2C424',
    'N': '#869BE0',
    'O': '#E5FD42',
    'P': '#F03587',
    'Q': '#0E2322',
    'R': '#D5B818',
    'S': '#6D35F0',
    'T': '#40C8EF',
    'U': '#35F071',
    'V': '#761A0D',
    'W': '#80B0A2',
    'X': '#4D0004',
    'Y': '#B1DA34',
    'Z': '#062445',
    'BLANK': '#ffffff',
    'NONE': 'transparent',
};

export default Board;
