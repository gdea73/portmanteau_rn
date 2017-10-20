import React from 'react';
import {
	Platform,
	ScrollView,
	View,
	StyleSheet,
	Text,
	NativeModules,
	AsyncStorage,
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Board from '../components/TileBoard';
import GameStatus from '../components/GameStatus';
import Constants from '../etc/Constants';

const PADDING = 10;
var { width, height } = require('Dimensions').get('window');
const { StatusBarManager } = NativeModules;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
// this was 7/8 but I left room for padding in a janky way
const BOARD_ASPECT_RATIO = 7/8.05;

class GameScreen extends React.Component {
	static navigationOptions = {
		title: 'Game',
		headerMode: 'none',
	};

	componentDidMount() {
		/* TODO: mess with persistent game storage
		try {
			AsyncStorage.getItem('@Portmanteau:lastGame')
				.then(this.tryLoadGame(value));
		} catch (error) {
			console.info('error attempting to load game: ' + error);
		} */
	}

	tryLoadGame(game) {
		if (game !== null) {
			console.debug('Loaded a game in progress from AsyncStorage.');
			this.props.initialCols = lastGame.cols;
			this.props.initialDropTile = lastGame.initialDropTile;
		}
	}

	render() {
		console.debug('board width in boardview: ' + (width - 2 * PADDING));
		return(
			<View style={styles.container}>
				<GameStatus onRef={ref => (this.gameStatus = ref) } />
				<View style={styles.boardView}>
					<Board width={width - 2 * PADDING}
						   increaseScore={this.increaseScore.bind(this)}
						   incrementMoveCount={this.incrementMoveCount.bind(this)}
						   addRecentWord={this.addRecentWord.bind(this)}
						   gameOver={this.gameOver.bind(this)}
						   initialCols={this.props.initialCols}
						   initialDropTile={this.props.initialDropTile}
					/>
				</View>
			</View>
		);
	}

	// Callback for Board to signify game over
	gameOver() {
		console.debug('game over');
		// TODO: write GameOverScreen & link with stats from GameStatus
	}

	// Callbacks for Board to update GameStatus
	increaseScore(points, chainLevel) {
		this.gameStatus.increaseScore(points, chainLevel);
		// TODO: animate display of chain level if > 1
	}
	incrementMoveCount() {
		this.gameStatus.incrementMoveCount();
	}
	addRecentWord(word) {
		this.gameStatus.addRecentWord(word);
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
