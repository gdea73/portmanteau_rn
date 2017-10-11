import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Tile from './Tile';
import Constants from '../etc/Constants';

const {width, height} = require('Dimensions').get('window');
const TILE_TEXT_NONE = ' ';
const VIEWS_BORDER_RAD = 4;
const DEFAULT_DROP_COL = 3;
const BOARD_SIZE = 7;

// layer constants are summed with column numbers
// to generate unique View keys for each layer of
// a column; also used to determine transparency.
const COL_BG_LAYER = 100;
const COL_TOUCH_LAYER = 200;

var tileSize, tileBorderRad, board_x, board_y, board_width, board_height;

class Board extends React.Component {

	constructor(props) {
		super(props);
		if (this.props.initialCols) {
			this.cols = this.props.initialCols;
		} else {
			// initialize the board as empty
			this.cols = [
				[' ', ' ', ' ', ' ', ' ', ' ', ' '],
				[' ', ' ', ' ', ' ', ' ', ' ', ' '],
				[' ', ' ', ' ', ' ', ' ', ' ', ' '],
				[' ', ' ', ' ', ' ', ' ', ' ', ' '],
				[' ', ' ', ' ', ' ', ' ', ' ', ' '],
				[' ', ' ', ' ', ' ', ' ', ' ', ' '],
				[' ', ' ', ' ', ' ', ' ', ' ', ' '],
			];
		}
		var dropTile = this.props.initialDropTile || this.getNewDropTile();
		this.stilesInitialized = false;
		var stiles = [];
		this.state = {
			stiles: stiles,
		}
	}

	// This triggers a refresh of the component (see below).
	loadGame(cols, dropTile) {
		this.cols = cols;
		setDropTileState(dropTile);
	}

	// The idea is that the board can (should) be refreshed
	// when a new drop tile is set, as that implies any and
	// all animations and back-end changes triggered by the
	// most recent drop have completed.
	setDropTileState(dropTile) {	
		var newState = this.state;
		newState['dropTile'] = dropTile;
		this.setState(newState);
	}

	initializeStiles() {
		tileSize = (this.props.width - 8 * Constants.tilePadding) / BOARD_SIZE;
		var stiles = [];
		for (let col = 0; col < BOARD_SIZE; col++) {
			stiles[col] = [];
			for (let row = 0; row < BOARD_SIZE; row++) {
				if (this.cols[col][row] === ' ') {
					stiles[col][row] = undefined;
				} else {
					stiles[col][row] = {
						top: row * (tileSize + Constants.tilePadding),
					}
				}
			}
		}
		this.stilesInitialized = true;
		this.setState({stiles});
	}

    render() {
		if (!this.stilesInitialized) {
			this.initializeStiles();
		}
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
		var stile = {
			backgroundColor: TILE_COLORS[this.props.dropTile],
			borderRadius: tileBorderRad,
			height: tileSize,
			width: tileSize,
			top: 0,
			left: this.getColStartCoord(DEFAULT_DROP_COL),
		}
		return(
			<Tile onRef={ref => (this.dropTile = ref)} size={tileSize}
				  style={stile} text={this.state.dropTile}>
			</Tile>
		);
	}

    renderColumns() {
        var result = []; 
        for (let colNo = 0; colNo < BOARD_SIZE; colNo++) {
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

	renderTiles(colNo) {
		var result = [];
		for (let rowNo = 0; rowNo < BOARD_SIZE; rowNo++) {
			let stile = {
				backgroundColor: TILE_COLORS[this.cols[colNo][rowNo]],
				height: tileSize,
				width: tileSize,
				top: rowNo * (tileSize + Constants.tilePadding),
				borderRadius: tileBorderRad,
				left: 0,
			}
			if (this.cols[colNo][rowNo] !== TILE_TEXT_NONE) {
				result.push(
					<Tile key={this.getTileId(colNo, rowNo)} style={stile}
						  size={tileSize} />
				);
			}
		}
		return result;
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
            top: Constants.tilePadding + tileSize,
            left: this.getColStartCoord(index),
            backgroundColor: bgColor,
            width: tileSize,
            height: tileSize * BOARD_SIZE + 9 * Constants.tilePadding,
            borderRadius: borderR,
            // TODO: test this properly
            overflow: 'scroll',
        }
    }

    getColStartCoord(colNo) {
        return tileSize * colNo + (colNo + 1) * Constants.tilePadding;
    }

    getTileId(colNo, rowNo) {
        return BOARD_SIZE * colNo + rowNo;
    }

	handleColClick(colNo) {
		// TODO: this
	}

	getNewDropTile() {
		// TODO: implement weights on tile values
		// return 65 + Math.floor(26 * Math.random());
		return 65;
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
