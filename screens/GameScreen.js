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
	Image,
	BackHandler
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Board from '../components/TileBoard';
import GameStatus from '../components/GameStatus';
import Constants from '../etc/Constants';

const PADDING = 10;
var { width, height } = require('Dimensions').get('window');
const { StatusBarManager } = NativeModules;

class GameScreen extends React.Component {
	/* static navigationOptions = {
		header: null,
	}; */

	constructor(props) {
		super(props);
		this.state = {
			gameOver: false,
		}
	   this.increaseScore=this.increaseScore.bind(this);
	   this.incrementMoveCount=this.incrementMoveCount.bind(this);
	   this.addRecentWord=this.addRecentWord.bind(this);
	   this.gameOver=this.gameOver.bind(this);
	   this.autoSaveGame=this.autoSaveGame.bind(this);

	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPress);
	}

	onBackButtonPress = () => {
		console.debug('back button pressed in gamescreen; returning false;');
		return true;
	}

	autoSaveGame() {
		// This function is to be called periodically by the Board, and will
		// save the current board state (including drop tile), and game status
		// to AsyncStorage.
	}

	displayQuitModal() {
		// this should be called on the press of the 'Back' button,
		// and should render a modal asking the user whether they want
		// to save or discard the game in progress. However, if the game has
		// already ended, this should do nothing.
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
							   increaseScore={this.increaseScore}
							   incrementMoveCount={this.incrementMoveCount}
							   addRecentWord={this.addRecentWord}
							   gameOver={this.gameOver}
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
