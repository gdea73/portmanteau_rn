import React from 'react';
import {
	Platform,
	ScrollView,
	View,
	StyleSheet,
	Text,
	NativeModules,
	Image,
	BackHandler
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Board from '../components/TileBoard';
import GameStatus from '../components/GameStatus';
import NavButton from '../components/NavButton';
import Constants from '../etc/Constants';
import Storage from '../etc/Storage';
import Words from '../etc/Words';

var { width, height } = require('Dimensions').get('window');
const { StatusBarManager } = NativeModules;
const AUTOSAVE_INTERVAL_MS = 30 * 1000;

class GameScreen extends React.Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
		super(props);
		this.state = {
			gameOver: false,
			showQuitModal: false,
		}
		this.getMoveCount = this.getMoveCount.bind(this);
		if (this.props.navigation.state.params
			&& this.props.navigation.state.params.gameData) {
			console.debug('GameScreen was passed saved game data');
			var gameData = this.props.navigation.state.params.gameData;
			this.initialCols = gameData.cols;
			this.initialDropLetter = gameData.dropLetter;
			// load saved game stats for the GameStatus component
			this.initialStats = gameData.gameStats;
			// load the shuffled collection of tiles
			Words.setTileSet(gameData.tileSet);
		}
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPress);
		this.autosave();
	}

	autosave = () => {
		this.saveGame();
		this.timer = setTimeout(
			() => { this.autosave() },
			AUTOSAVE_INTERVAL_MS
		);
	}

	componentWillUpdate() {
		// clear any saved-game data if the game is over
		if (this.state.gameOver) {
			this.removeSavedGame();
		}
	}

	removeSavedGame() {
		Storage.removeSavedGame().then(() => {
			console.debug('removed saved game');
		}).catch(() => {
			console.debug('failed to remove saved game (maybe there was none)');	
		});
	}

	saveHighScore = (score) => {
		var d = new Date();
		var date = '';
		date += (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
		var newScore = {
			score: score,
			date: date
		};
		Storage.loadHighScores().then((scoresJSON) => {
			var scores = JSON.parse(scoresJSON);
            console.debug('loaded high scores (pre-save)');
            if (score > scores[0].score) {
                // worth adding to the list
				var status = 'high';
				if (score > scores[Constants.N_HIGH_SCORES - 1]) {
					status = 'best';
				}
                scores[0] = newScore;
                scores.sort((score_a, score_b) => {
					var a = score_a.score;
					var b = score_b.score;
					if (a == null && b == null || a == b) {
						return 0;
					}
					if (a == null || a < b) {
						return -1;
					}
					if (b == null || b > a) {
						return 1;
					}
				});
                Storage.saveHighScores(scores).then(() => {
					console.debug('successfully saved high scores');
					return status;
				}).catch((error) => {
					console.warn('failed to save high scores: ' + error);
					return error;
				});
            } else {
				return 'low';
			}
        }).catch(() => {
            // most likely, no high scores have yet to be saved;
            // create a new array of size N_HIGH_SCORES
            var scores = []; 
            for (var i = 0; i < Constants.N_HIGH_SCORES - 1; i++) {
                scores[i] = {
					score: 0,
					date: null
				};
            }   
            scores[Constants.N_HIGH_SCORES - 1] = newScore;
            Storage.saveHighScores(scores).then(() => {
				console.debug('successfully saved high scores');
				return 'best';
			}).catch((error) => {
				console.debug('failed to save high scores: ' + error);
				return error;
			});
        }); 
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPress);
		clearTimeout(this.timer);
	}

	onBackButtonPress = () => {
		console.debug('back button handler called in GameScreen');
		if (this.state.showQuitModal) {
			console.debug('\tcancelling quit modal');
			// dismiss (cancel) the quit modal if currently being shown)
			var state = this.state;
			state.showQuitModal = false;
			this.setState(state);
		} else if (this.state.gameOver) {
			console.debug('\tgame is over, going back');
			// If the game is over, a back button press must immediately quit,
			// but also must remove any saved game data.
			this.removeSavedGame();
			this.props.navigation.goBack(null);
		} else {
			// the game is in progress; show quit modal for confirmation
			console.debug('\tshowing quit modal');
			var state = this.state;
			state.showQuitModal = true;
			this.setState(state);
		}
		return true;
	}

	saveGame = (callback) => {
		// This function is to be called periodically by the Board, and will
		// save the current board state (including drop tile and tile set), and
		// game status to AsyncStorage.
		console.debug('saving game');
		return Storage.saveGame(
			this.getStats(), this.boardRef.state.dropLetter,
			this.boardRef.state.cols, Words.getTileSet()
		).then(callback);
	}

	// This should be called on the press of the 'Back' button,
	// and should render a modal asking the user whether they want
	// to save or discard the game in progress. However, if the game has
	// already ended, this should do nothing.
	renderQuitModal = () => {
		return (
			<View style={styles.quitModalContainer}>
				<View style={styles.quitModal}>
					<NavButton
						buttonStyle={styles.modalButton}
						textStyle={styles.modalButtonText}
						onPress={() => {
							this.saveGame(() => {
								console.debug('game saved successfully');
								this.props.navigation.goBack(null);
								// execute the MenuScreen callback; otherwise,
								// the game can only be resumed after a restart.
								this.props.navigation
									.state.params.onSaveCallback();
							});
						}}
						title="Save & Quit"
					/>
					<NavButton
						buttonStyle={styles.modalButton}
						textStyle={styles.modalButtonText}
						onPress={() => {
							console.debug('discarding game');
							this.removeSavedGame();
							this.props.navigation.goBack(null);
							this.props.navigation
								.state.params.onSaveCallback();
						}}
						title="Discard & Quit"
					/>
					<NavButton
						buttonStyle={styles.modalButton}
						textStyle={styles.modalButtonText}
						onPress={() => {
							console.debug('giving up');
							this.gameOver();
						}}
						title="End Game"
					/>
					<NavButton
						buttonStyle={styles.modalButton}
						textStyle={styles.modalButtonText}
						onPress={() => {
							var state = this.state;
							state.showQuitModal = false;
							this.setState(state);
						}}
						title="Return to Game"
					/>
				</View>
			</View>
		);
	}

	getStats = () => {
		return  {
			score: this.gameStatus.state.score,
			moves: this.gameStatus.state.moves,
			level: this.gameStatus.state.level,
			tilesBroken: this.gameStatus.state.tilesBroken,
			longestChain: this.gameStatus.state.longestChain,
			longestWord: this.gameStatus.state.longestWord,
			recentWords: this.gameStatus.state.recentWords,
		};
	}

	renderGameOver = () => {
		// disable autosave timer to prevent attempted access to unmounted
		// GameStatus component
		clearTimeout(this.timer);
		var stats = this.getStats();
		var scoreStatus = this.saveHighScore(stats.score);
		var scoreStatusText = '';
		// TODO: fix these messages
		if (scoreStatus === 'best') {
			scoreStatusText = 'NEW HIGH SCORE';
		} else if (scoreStatus === 'high') {
			scoreStatusText = 'IN THE TOP 10';
		}
		return(
			<View style={styles.gameOverContainer}>
				<View style={{flex: 1}}>
					<Text style={styles.gameOverText}>GAME OVER</Text>
					<Text style={styles.gameOverText}>{scoreStatusText}</Text>
				</View>
				<View style={{flex: 4, justifyContent: 'space-around'}}>
					<Text style={styles.gameOverScoreText}>{stats.score}</Text>
					<Text style={styles.gameOverLongestWordText}>LONGEST WORD: {stats.longestWord} letters</Text>
					<Text style={styles.gameOverLongestChainText}>LONGEST CHAIN: {stats.longestChain} words</Text>
					<Text style={styles.gameOverMovesText}>TOTAL MOVES: {stats.moves}</Text>
					<NavButton
						onPress={() => {
							this.removeSavedGame();
							this.props.navigation.goBack(null);
							this.props.navigation
								.state.params.onSaveCallback();
						}}
						title="GO BACK"
					/>
				</View>
			</View>
		);
	}
	
	render() {
		if (this.state.gameOver) {
			return this.renderGameOver();
		}
		return(
			<View style={{flex: 1, backgroundColor: 'black'}}>
				<Image style={Constants.BG_IMAGE_STYLE}
					   source={require('../img/gradient_bg.png')} />
				<View style={styles.container}>
					<GameStatus
						onRef={ref => (this.gameStatus = ref) }
						initialStats={this.initialStats}
					/>
					<View style={styles.boardView}>
						<Board width={Math.floor(width - 2 * Constants.UI_PADDING)}
							   increaseScore={this.increaseScore}
							   incrementMoveCount={this.incrementMoveCount}
							   addTilesBrokenCount={this.addTilesBrokenCount}
							   getMoveCount={this.getMoveCount}
							   getLevel={this.getLevel}
							   addRecentWord={this.addRecentWord}
							   gameOver={this.gameOver}
							   initialCols={this.initialCols}
							   initialDropLetter={this.initialDropLetter}
							   onRef={ref => (this.boardRef = ref) }
						/>
					</View>
				</View>
				{this.state.showQuitModal && this.renderQuitModal()}
			</View>
		);
	}

	gameOver = () => {
		var newState = this.state;
		newState.gameOver = true;
		this.setState(newState);
	}

	// Callbacks for Board to update GameStatus
	increaseScore = (points, chainLevel) => {
		this.gameStatus.increaseScore(points, chainLevel);
		// TODO: animate display of chain level if > 1
	}
	addTilesBrokenCount = (tilesBroken) => {
		this.gameStatus.addTilesBrokenCount(tilesBroken);
	}
	incrementMoveCount = () => {
		this.gameStatus.incrementMoveCount();
	}
	getMoveCount() {
		if (!this.gameStatus) {
			return 0;
		}
		return this.gameStatus.state.moves;
	}
	getLevel = () => {
		return this.gameStatus.state.level;
	}
	// Allows Board to query total move count for level-based logic
	addRecentWord = (word) => {
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
		paddingTop: Constants.UI_PADDING
			+ (Platform.OS === 'ios'
			? Constants.STATUS_BAR_HEIGHT : 0),
		paddingLeft: Constants.UI_PADDING,
		paddingRight: Constants.UI_PADDING,
		paddingBottom: Constants.UI_PADDING,
	},
	boardView: {
		aspectRatio: Constants.BOARD_ASPECT_RATIO,
		justifyContent: 'space-between',
	},
	gameOverContainer: {
        position: 'absolute',
		padding: 40,
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#123',
		flexDirection: 'column',
		justifyContent: 'center',
    },  
    gameOverText: {
		fontFamily: Constants.LEAGUE_SPARTAN,
        fontSize: 42, 
		textAlign: 'center',
        color: 'white',
    },  
    gameOverScoreText: {
		fontFamily: Constants.LEAGUE_SPARTAN,
        fontSize: 42, 
		textAlign: 'center',
        color: 'white',
    },  
    gameOverLongestChainText: {
		fontFamily: Constants.LEAGUE_SPARTAN,
        fontSize: 24, 
		textAlign: 'center',
        color: 'white',
    },  
    gameOverLongestWordText: {
		fontFamily: Constants.LEAGUE_SPARTAN,
        fontSize: 24, 
		textAlign: 'center',
        color: 'white',
    },  
    gameOverMovesText: {
		fontFamily: Constants.LEAGUE_SPARTAN,
        fontSize: 18, 
		textAlign: 'center',
        color: 'white',
    }, 
	quitModalContainer: {
		position: 'absolute',
		top: 0, left: 0, right: 0, bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	quitModal: {
		backgroundColor: 'white',
		borderRadius: Constants.DEFAULT_BORDER_RAD,
		padding: 20,
	},
	modalButton: {
		borderColor: 'black',
		margin: 10,
	},
	modalButtonText: {
		color: 'black',
	},
});

export default GameScreen;
