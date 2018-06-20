import React from 'react';
import {
	Platform,
	ScrollView,
	View,
	StyleSheet,
	Text,
	NativeModules,
	Image,
	BackHandler,
	Animated,
	FlatList,
	PixelRatio,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { AdMobBanner } from 'react-native-admob';

import Board from '../components/TileBoard';
import GameStatus from '../components/GameStatus';
import NavButton from '../components/NavButton';
import Constants from '../etc/Constants';
import Storage from '../etc/Storage';
import Words from '../etc/Words';

var { width, height } = require('Dimensions').get('window');
const { StatusBarManager } = NativeModules;
const AUTOSAVE_INTERVAL_MS = 30 * 1000;
const GAME_OVER_FINAL_OPACITY = 0.92;
const GAME_OVER_FADE_DURATION = 300;
const QUIT_MODAL_FINAL_OPACITY = 0.95;
const QUIT_MODAL_FADE_DURATION = 200;
const QUIT_MODAL_FADE_IN = 1;

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
		// prepare opacity animation for modal and game over
		this.gameOverOpacity = new Animated.Value(0.0);
		this.quitModalOpacity = new Animated.Value(0.0);
		this.quitModalFadeIn = false;
		console.debug('pixel ratio: ' + PixelRatio.get());
		this.boardHeightScaleThreshold = 0.433 * PixelRatio.get();
		if (Constants.showAds) {
			this.boardHeightScaleThreshold *= 0.9;
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

	hideQuitModal = () => {
		var state = this.state;
		state.showQuitModal = false;
		console.debug('fading modal out');
		Animated.timing(
			this.quitModalOpacity, {
				toValue: 0,
				duration: QUIT_MODAL_FADE_DURATION
			}
		).start(() => {console.debug('fade out done'); this.setState(state)});
	}

	componentDidUpdate = () => {
		if (this.state.gameOver) {
			// clear any saved-game data if the game is over
			this.removeSavedGame();
			Animated.timing(
				this.gameOverOpacity, {
					toValue: GAME_OVER_FINAL_OPACITY,
					duration: GAME_OVER_FADE_DURATION
				}
			).start();
		}
		if (this.quitModalFadeIn) {
			console.debug('fading modal in');
			Animated.timing(
				this.quitModalOpacity, {
					toValue: QUIT_MODAL_FINAL_OPACITY,
					duration: QUIT_MODAL_FADE_DURATION
				}
			).start(() => {this.quitModalFadeIn = false});
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
				}).catch((error) => {
					console.warn('failed to save high scores: ' + error);
				});
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
				console.debug('successfully saved first high score');
			}).catch((error) => {
				console.debug('failed to save first high score: ' + error);
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
			this.hideQuitModal();
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
			this.quitModalFadeIn = true;
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
		var style = [
			styles.quitModalContainer,
			{ opacity: this.quitModalOpacity }
		];
		return (
			<Animated.View style={style}>
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
							this.hideQuitModal();
							this.gameOver();
						}}
						title="End Game"
					/>
					<NavButton
						buttonStyle={styles.modalButton}
						textStyle={styles.modalButtonText}
						onPress={this.hideQuitModal}
						title="Return to Game"
					/>
				</View>
			</Animated.View>
		);
	}

	getStats = () => {
		return {
			score: this.gameStatus.state.score,
			moves: this.gameStatus.state.moves,
			level: this.gameStatus.state.level,
			nextLevelThreshold: this.gameStatus.state.nextLevelThreshold,
			tilesBroken: this.gameStatus.state.tilesBroken,
			wordsBroken: this.gameStatus.state.wordsBroken,
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
		var style = [styles.gameOverContainer, { opacity: this.gameOverOpacity }];
		return (
			<Animated.View style={style}>
				<View style={{flex: 1, paddingBottom: 10}}>
					<Text style={styles.gameOverText}>GAME OVER</Text>
					<Text style={styles.gameOverScoreText}>{stats.score}</Text>
				</View>
				{this.renderGameOverStats(stats)}
				<NavButton
					onPress={() => {
						this.removeSavedGame();
						this.props.navigation.goBack(null);
						this.props.navigation
							.state.params.onSaveCallback();
					}}
					title="GO BACK"
				/>
			</Animated.View>
		);
	}
	
	renderGameOverStats = (stats) => {
		this.saveHighScore(stats.score);
		var averageWordLength = stats.tilesBroken / stats.wordsBroken;
		if (!averageWordLength) averageWordLength = 0; // avoid NaN
		averageWordLength = averageWordLength.toFixed(3);
		var stats_array = [
			{ key: 'LEVEL', value: stats.level },
			{ key: 'MOVES', value: stats.moves },
			{ key: 'TILES BROKEN', value: stats.tilesBroken },
			{ key: 'WORDS BROKEN', value: stats.wordsBroken },
			{ key: 'AVERAGE WORD LENGTH', value: averageWordLength },
			{ key: 'LONGEST WORD', value: stats.longestWord },
			{ key: 'LONGEST CHAIN', value: stats.longestChain },
		];
		return (
			<View style={styles.gameOverStatsContainer}>
				<FlatList
					data={stats_array} renderItem={({item}) => 
							<View style={{
								justifyContent: 'space-between',
								flexDirection: 'row',
								paddingTop: 5,
							}}>
							<View style={{flex: 1}}>
								<Text style={[
									styles.gameOverStatsText,
									{textAlign: 'left'}
								]}>
									{item.key}
								</Text>
							</View>
							<View style={{flex: 0}}>
								<Text style={[
									styles.gameOverStatsText,
									{textAlign: 'left'}
								]}>
									{item.value}
								</Text>
							</View>
						</View>
					}
				/>
			</View>
		);
	}

	render() {
		var boardWidth = Math.floor(width - 2 * Constants.UI_PADDING);
		console.debug('board width: ' + boardWidth);
		console.debug('board height: ' + boardWidth / Constants.BOARD_ASPECT_RATIO);
		console.debug('viewport height: ' + height);
		console.debug('max board height percentage: ' + this.boardHeightScaleThreshold);
		if (
			boardWidth / Constants.BOARD_ASPECT_RATIO / height 
			> this.boardHeightScaleThreshold
			// maximum percentage of total viewport height
		) {
			boardWidth = this.boardHeightScaleThreshold * height
			           * Constants.BOARD_ASPECT_RATIO;
			console.debug('board width (adjusted): ' + boardWidth);
		}
		return(
			<View style={{flex: 1, backgroundColor: 'black'}}>
				<Image style={Constants.BG_IMAGE_STYLE}
					   source={require('../img/gradient_bg.png')} />
				<View style={styles.container}>
					<View style={{
						...Constants.BTN_HEADER_STYLE, margin: 10
					}}>
						<NavButton
							onPress={this.onBackButtonPress}
							title="←"
							textStyle={{fontSize: 12}}
							height={Constants.BTN_HEIGHT}
							buttonStyle={Constants.NAV_BTN_STYLE}
							textStyle={Constants.NAV_BTN_FONT_STYLE}
						/>
						<Text style={Constants.HEADER_TEXT_STYLE}>
							PORTMANTEAU
						</Text>
						<NavButton
							onPress={() => { }}
							title="←"
							textStyle={{fontSize: 12}}
							height={Constants.BTN_HEIGHT}
							buttonStyle={Constants.NAV_BTN_STYLE}
							textStyle={{color: 'transparent'}}
						/>
					</View>
					<GameStatus
						onRef={ref => (this.gameStatus = ref) }
						initialStats={this.initialStats}
					/>
					<View style={[styles.boardView, {width: boardWidth}]}>
						<Board width={boardWidth}
							   increaseScore={this.increaseScore}
							   incrementMoveCount={this.incrementMoveCount}
							   addTilesBrokenCount={this.addTilesBrokenCount}
							   incrementWordsBrokenCount={this.incrementWordsBrokenCount}
							   getMoveCount={this.getMoveCount}
							   getLevel={this.getLevel}
							   addRecentWord={this.addRecentWord}
							   gameOver={(this.state.gameOver ? undefined : this.gameOver)}
							   initialCols={this.initialCols}
							   initialDropLetter={this.initialDropLetter}
							   onRef={ref => (this.boardRef = ref) }
						/>
					</View>
					{Constants.showAds && this.renderAdBanner()}
				</View>
				{(this.state.gameOver && this.renderGameOver())
					|| (this.state.showQuitModal && this.renderQuitModal())}
			</View>
		);
	}

	renderAdBanner = () => {
		return (
			<View style={styles.adView}>
				<AdMobBanner
					adSize="banner"
					adUnitID="ca-app-pub-8559716447664382/7140833780"
					testDevices={["D2EFADE35D710C83CFA429B08A06F454"]}
					onAdFailedToLoad={error => console.info(error)}
				/>
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
	incrementWordsBrokenCount = () => {
		this.gameStatus.incrementWordsBrokenCount();
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
		paddingLeft: Constants.UI_PADDING,
		paddingRight: Constants.UI_PADDING,
		paddingBottom: Constants.UI_PADDING,
		alignItems: 'center',
	},
	boardView: {
		aspectRatio: Constants.BOARD_ASPECT_RATIO,
		justifyContent: 'space-between',
	},
	adView: {
		alignSelf: 'center',
	},
	gameOverContainer: {
        position: 'absolute',
		padding: 40,
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#222222',
		flexDirection: 'column',
		justifyContent: 'space-between',
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
    gameOverStatsText: {
		fontFamily: Constants.LEAGUE_SPARTAN,
        fontSize: 14, 
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
	gameOverStatsContainer: {
		flex: 0,
		bottom: 20,
		justifyContent: 'space-around',
	},
});

export default GameScreen;
