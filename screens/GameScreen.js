import React from 'react';
import {
	Platform,
	ScrollView,
	View,
	Button,
	StyleSheet,
	Text,
	NativeModules,
	AsyncStorage,
	Image
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Board from '../components/TileBoard';
import GameStatus from '../components/GameStatus';
import Constants from '../etc/Constants';

const PADDING = 10;
var { width, height } = require('Dimensions').get('window');
const { StatusBarManager } = NativeModules;

class GameScreen extends React.Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
		super(props);
		this.state = {
			gameOver: false,
		}
	}

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
			this.props.initialDropLetter = lastGame.initialDropLetter;
		}
	}
	
	render() {
		// console.debug('board width in boardview: ' + (width - 2 * PADDING));
		if (this.state.gameOver) {
			var stats = {
				score: this.gameStatus.state.score,
				moves: this.gameStatus.state.moves,
				longestChain: this.gameStatus.state.longestChain,
				longestWord: this.gameStatus.state.longestWord,
			};
			return(
				<View style={styles.gameOverContainer}>
					<View style={{flex: 1}}>
						<Text style={styles.gameOverTitleText}>GAME OVER</Text>
					</View>
					<View style={{flex: 4, justifyContent: 'space-around'}}>
						<Text style={styles.gameOverScoreText}>{stats.score}</Text>
						<Text style={styles.gameOverLongestWordText}>Longest Word: {stats.longestWord}</Text>
						<Text style={styles.gameOverLongestChainText}>Longest Chain: {stats.longestChain}</Text>
						<Text style={styles.gameOverMovesText}>Total Moves: {stats.moves}</Text>
						<Button
							onPress={() => {
								this.props.navigation.goBack(null);
							}}
							title="Go Back"
						/>
					</View>
				</View>
			);
		}
		return(
			<View style={{flex: 1, backgroundColor: 'black'}}>
				<Image style={Constants.BG_IMAGE_STYLE}
					   source={require('../img/gradient_bg.png')} />
				<View style={styles.container}>
					<GameStatus onRef={ref => (this.gameStatus = ref) } />
					<View style={styles.boardView}>
						<Board width={Math.floor(width - 2 * PADDING)}
							   increaseScore={this.increaseScore.bind(this)}
							   incrementMoveCount={this.incrementMoveCount.bind(this)}
							   addRecentWord={this.addRecentWord.bind(this)}
							   gameOver={this.gameOver.bind(this)}
							   initialCols={this.props.initialCols}
							   initialDropLetter={this.props.initialDropLetter}
						/>
					</View>
				</View>
			</View>
		);
	}

	gameOver() {
		var newState = this.state;
		newState.gameOver = true;
		this.setState(newState);
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
		position: 'absolute',
		top: 0, left: 0, right: 0, bottom: 0,
		flexDirection: 'column',
		backgroundColor: 'transparent',
		justifyContent: 'space-between',
		paddingTop: PADDING + Constants.STATUS_BAR_HEIGHT,
		paddingLeft: PADDING,
		paddingRight: PADDING,
		paddingBottom: PADDING,
	},
	boardView: {
		aspectRatio: Constants.BOARD_ASPECT_RATIO,
		justifyContent: 'space-between',
	},
	viewDefault: {
		borderRadius: Constants.defaultBorderRad,
	},
	gameOverContainer: {
        position: 'absolute',
		padding: 40,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#123',
		flexDirection: 'column',
		justifyContent: 'center',
    },  
    gameOverTitleText: {
        fontSize: 42, 
		textAlign: 'center',
        color: 'white',
    },  
    gameOverScoreText: {
        fontSize: 42, 
		textAlign: 'center',
        color: 'white',
    },  
    gameOverLongestChainText: {
        fontSize: 24, 
		textAlign: 'center',
        color: 'white',
    },  
    gameOverLongestWordText: {
        fontSize: 24, 
		textAlign: 'center',
        color: 'white',
    },  
    gameOverMovesText: {
        fontSize: 16, 
		textAlign: 'center',
        color: 'white',
    },  
});

export default GameScreen;
