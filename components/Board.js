import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import GameStatus from './GameStatus';

const {width, height} = require('Dimensions').get('window');
const TILE_PADDING = 3;
const TILE_FONT_SIZE = 18;
const VIEWS_BORDER_RAD = 4;

// layer constants are summed with column numbers
// to generate unique View keys for each layer of
// a column; also used to determine transparency.
const COL_BG_LAYER = 100;
const COL_TOUCH_LAYER = 200;

var tileSize, tileBorderRad, board_x, board_y, board_width, board_height;

class Board extends React.Component {
	render() {
		// console.debug('Board.render(): props.width: ' + this.props.width);
		tileSize = (this.props.width - 8 * TILE_PADDING) / 7.0;
		// console.debug('Board.render(): calculated tileSize' + tileSize);
		tileBorderRad = Math.floor(tileSize / 5);
		return (
			<View
				style={[styles.container, styles.boardContainer]}>
				{this.renderDropTile()}
				{this.renderColumns()}
			</View>
		);
	}

	renderDropTile() {
		var dropCol = this.props.dropCol;
		var stile = {
			backgroundColor: TILE_COLORS[this.props.dropTile],
			borderRadius: tileBorderRad,
			height: tileSize,
			width: tileSize,
			top: 0,
			// left: tileSize * dropCol + TILE_PADDING * (dropCol + 1),
			left: this.getColStartCoord(dropCol),
		}
		// console.debug('this.props.width    drop tile: ' + this.props.width);
		// console.debug('tile size in render drop tile: ' + tileSize);
		// console.debug('border radius? ' + tileBorderRad);
		// console.debug('TILE_COLORS[' + this.props.dropTile + '] = ' + TILE_COLORS[this.props.dropTile]);
		// console.debug('left? ' + tileSize * dropCol + TILE_PADDING * (dropCol + 1));
		return(
			<View style={[styles.tileView, stile]}>
				<Text style={styles.tileText}>{this.props.dropTile}</Text>
			</View>
		);
	}

	renderColumns() {
		var result = [];
		for (let colNo = 0; colNo < 7; colNo++) {
			// first, render the views to provide the background color per-column
			// second, within these views, render the actual tiles
			let key = COL_BG_LAYER + colNo;
			result.push(
					<View key={key}
						style={this.getColStyle(key)}>
						{this.renderTiles(colNo)}
					</View>
			);
			// last, render the transparent views above the tiles to handle touch events
			key = COL_TOUCH_LAYER + colNo;
			result.push(
				<View key={key} style={this.getColStyle(key)}
					onStartShouldSetResponder={() => this.handleColClick(colNo)}>
				</View>
			);
		}
		return result;
	}

	handleColClick(colNo) {
		 // // console.debug('col ' + colNo + ' pressed');
		 this.props.onDrop(colNo);
		 this.props.dropCol = colNo;
	}

	renderTiles(colNo) {
		var result = [];
		for (let i = 0; i < 7; i++) {
			if (this.props.cols[colNo][i] !== 'none') {
				result.push(this.renderTile(colNo, i));
			}
		}
		return result;
	}

	renderTile(colNo, rowNo) {
		// // console.debug('rendering tile (' + colNo + ', ' + rowNo + '): ' + this.props.cols[colNo][rowNo]);
		var stile = {
			backgroundColor: TILE_COLORS[this.props.cols[colNo][rowNo]],
			height: tileSize,
			width: tileSize,
			top: rowNo * (tileSize + TILE_PADDING),
			borderRadius: tileBorderRad,
			left: 0
		}
		return (
			<View key={this.getTileId(colNo, rowNo)} style={[styles.tileView, stile]}>
				<Text style={styles.tileText}>
					{this.getTileDisplayText(this.props.cols[colNo][rowNo])}
				</Text>
			</View>
		);
	}

	getTileDisplayText(tileString) {
		if (tileString === 'blank' || tileString === 'none') {
			return ' ';
		}
		return tileString;
	}

	getColStyle(columnKey) {
		var bgColor = 'transparent';
		var index = columnKey % 100;
		var layer = Math.floor(columnKey / 100) * 100;
		var borderR = 0;
		if (layer === COL_BG_LAYER) {
			// bgColor = '#' + index + index + index + index + index + index;
			borderR = 2;
		}
		return {
			flex: 0,
			position: 'absolute',
			top: TILE_PADDING + tileSize,
			left: this.getColStartCoord(index),
			backgroundColor: bgColor,
			width: tileSize,
			height: tileSize * 7 + 9 * TILE_PADDING,
			borderRadius: borderR,
			// TODO: test this properly
			overflow: 'scroll',
		}
	}

	getColStartCoord(colNo) {
		return tileSize * colNo + (colNo + 1) * TILE_PADDING;
	}

	getTileId(colNo, rowNo) {
		return 10 * colNo + rowNo;
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#000000',
		borderRadius: VIEWS_BORDER_RAD,
	},

	boardContainer: {
		flex: 1,
		backgroundColor: '#bbdfef',
	},

	dropTileContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: '#126424',
		height: tileSize,
	},

	tileView: {
		position: 'absolute',
		width: tileSize,
		height: tileSize,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'black',
	},

	tileText: {
		fontSize: TILE_FONT_SIZE,
		backgroundColor: 'transparent',
	}
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
