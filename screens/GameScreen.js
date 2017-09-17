import React from 'react';
import {
	Platform,
	ScrollView,
	View,
	StyleSheet,
	Text,
	NativeModules
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Board from '../components/Board';
import GameStatus from '../components/GameStatus';
import Constants from '../etc/Constants';

const PADDING = 10;
var { width, height } = require('Dimensions').get('window');
const { StatusBarManager } = NativeModules;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
// this was 7/8 but I left room for padding in a janky way
const BOARD_ASPECT_RATIO = 7/8.05;
const RECENT_word_SIZE = 14;
const RECENT_wordS_VISIBLE = 5;

class GameScreen extends React.Component {
	static navigationOptions = {
		title: 'Game',
		// headerMode: 'none',
	};

	constructor(props) {
		super(props);
		this.state = {
			gameOver: false,
			cols: [
				[' ', ' ', ' ', ' ', ' ', ' ', ' '],
				[' ', ' ', 'C', 'D', 'E', 'F', 'G'],
				['A', 'B', 'C', 'D', 'E', 'F', 'G'],
				['A', 'B', 'C', 'D', 'E', 'F', 'G'],
				['A', 'B', 'C', 'D', 'E', 'F', 'G'],
				['A', 'B', 'C', 'D', 'E', 'F', 'G'],
				['A', 'B', 'C', 'D', 'E', 'F', 'G'],
			],
			dropTile: 'P',
			dropCol: 1,
		};
	}

	render() {
		console.debug('board width in boardview: ' + (width - 2 * PADDING));
		return(
			<View style={styles.container}>
				<GameStatus />
				<View style={styles.boardView}>
					<Board cols={this.state.cols} dropTile={this.state.dropTile} dropCol={this.state.dropCol} width={width - 2 * PADDING} onDrop={(colNo) => this.onDrop(colNo)}/>
				</View>
			</View>
		);
	}
	
	onDrop(colNo) {
		var newState = this.state;
		newState['dropCol'] = colNo;
		this.setState(newState);
	}

	renderRecentWords() {
		return(
			<View>
				<Text style={styles.recentWord}>word 0</Text>
				<Text style={styles.recentWord}>word  1</Text>
				<Text style={styles.recentWord}>word   2</Text>
				<Text style={styles.recentWord}>word     4</Text>
				<Text style={styles.recentWord}>word      5</Text>
				<Text style={styles.recentWord}>word       6</Text>
				<Text style={styles.recentWord}>word        7</Text>
				<Text style={styles.recentWord}>word         8</Text>
				<Text style={styles.recentWord}>word          9</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#cccccc',
		justifyContent: 'space-between',
		paddingTop: PADDING + STATUS_BAR_HEIGHT,
		paddingLeft: PADDING,
		paddingRight: PADDING,
		paddingBottom: PADDING,
	},
	boardView: {
		aspectRatio: BOARD_ASPECT_RATIO,
		justifyContent: 'space-between',
	},
	viewDefault: {
		borderRadius: Constants.defaultBorderRad,
	},
});

export default GameScreen;
