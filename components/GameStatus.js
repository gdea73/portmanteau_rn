import React from 'react';
import { View, ScrollView, StyleSheet, Text, Button } from 'react-native';
import { StackNavigator } from 'react-navigation';
import * as Progress from 'react-native-progress';

import Constants from '../etc/Constants';

const RECENT_WORD_CACHE_SIZE = 14;
const RECENT_WORD_FONT_SIZE = 18;
const RECENT_WORD_FONT_WIDTH_RATIO = 0.8;
const PADDING = 3;
const BASE_LEVEL_THRESHOLD = 20;

class GameStatus extends React.Component {
	constructor(props) {
		super(props);
		recentWords = [];
		for (let i = 0; i < RECENT_WORD_CACHE_SIZE; i++) {
			recentWords.push('');
		}
		if (props.initialStats) {
			this.state = props.initialStats;
			console.debug('GameStatus received these initial stats:');
			console.debug(props.initialStats);
		} else {
			this.state = {
				score: 0,
				moves: 0,
				tilesBroken: 0,
				wordsBroken: 0,
				level: 1,
				lastLevelThreshold: 0,
				progress: 0.0,
				nextLevelThreshold: BASE_LEVEL_THRESHOLD,
				longestChain: 0,
				longestWord: 0,
				recentWords: recentWords,
			};
		}
	}

	// these functions allow the parent to access its GameScreen component
	// and the member functions
	componentDidMount() {
		this.props.onRef(this);
	}
	componentWillUnmount() {
		this.props.onRef(undefined);
	}

	increaseScore = (points, chainLevel) => {
		var newState = this.state;
		newState.score = this.state.score + points;
		if (chainLevel > this.state.longestChain) {
			console.debug('next longest chain level: ' + chainLevel);
			newState.longestChain = chainLevel;
		}
		this.setState(newState);
	}

	incrementMoveCount = () => {
		var newState = this.state;
		newState.moves = this.state.moves + 1;
		this.setState(newState);
	}

	addRecentWord = (word) => {
		var recentWords = this.state.recentWords.slice();
		for (let i = RECENT_WORD_CACHE_SIZE - 1; i >= 0; i--) {
			recentWords[i] = recentWords[i - 1];
		}
		recentWords[0] = word;
		var newState = this.state;
		if (word.length > this.state.longestWord) {
			newState.longestWord = word.length;
		}
		newState.recentWords = recentWords;
		this.setState(newState);
	}

	addTilesBrokenCount = (tilesBroken) => {
		var newState = this.state;
		newState.tilesBroken += tilesBroken;
		console.debug('total tiles broken now ' + newState.tilesBroken);
		if (newState.tilesBroken > newState.nextLevelThreshold) {
			newState.level = this.state.level + 1;
			newState.lastLevelThreshold = newState.nextLevelThreshold;
			newState.nextLevelThreshold += BASE_LEVEL_THRESHOLD
				* Math.ceil(this.state.level / 2.0);
		}
		console.debug('level threshold (' + newState.level + ') :'
			+ newState.nextLevelThreshold);
		newState.progress = (newState.tilesBroken - newState.lastLevelThreshold)
			/ (newState.nextLevelThreshold - newState.lastLevelThreshold);
		console.debug('level progress: ' + newState.progress);
		this.setState(newState);
	}

	incrementWordsBrokenCount = () => {
		var newState = this.state;
		newState.wordsBroken = this.state.wordsBroken + 1;
		console.debug('new words broken count: ' + newState.wordsBroken);
		this.setState(newState);
	}

	render() {
		var outerContainerStyle = [styles.outerContainer,
			{ height: this.props.height, width: this.props.width }];
		return(
			<View style={outerContainerStyle}>
				<View style={styles.statsContainer}>
					<Text style={[styles.labelDefault, {fontSize: 50}]}>
						{this.state.score}
					</Text>
					<Text style={styles.labelDefault}>
						LEVEL: {this.state.level}
					</Text>
					<Progress.Bar
						progress={this.state.progress}
						color={'white'}
					/>
				</View>
				<View style={styles.recentWordsOuterContainer}>
					<Text style={styles.labelDefault}>Recent Words:</Text>
					<ScrollView style={[styles.recentWordsInnerContainer]}>
						{this.renderRecentWords()}
					</ScrollView>	
				</View>
			</View>
		);
	}

	renderRecentWords() {
		var recentWords = [];
		for (let i = 0; i < Constants.RECENT_WORDS_COUNT; i++) {
			recentWords.push(
				<View key={'recentWords' + i}>
					<Text style={styles.recentWord}>{this.state.recentWords[i]}</Text>
				</View>
			);
		}
		return recentWords;
	}
}

const styles = StyleSheet.create({
    outerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Constants.COMPONENT_BG_COLOR,
        padding: PADDING,
		marginBottom: Constants.UI_PADDING,
		marginTop: 0,
		borderRadius: Constants.DEFAULT_BORDER_RAD,
    },
	statsContainer: {
		flex: 4,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-around',
	},
	labelDefault: {
		color: 'white',
		fontSize: 15,
		fontFamily: Constants.LEAGUE_SPARTAN,
	},
	recentWordsOuterContainer: {
		flex: 3,
		flexDirection: 'column',
		width: RECENT_WORD_FONT_SIZE * RECENT_WORD_FONT_WIDTH_RATIO * 7,
	},
	recentWordsInnerContainer: {
		flex: 1,
		backgroundColor: '#332222',
		borderRadius: Constants.DEFAULT_BORDER_RAD,
		paddingLeft: 2,
	},
	recentWord: {
		color: 'white',
		fontSize: RECENT_WORD_FONT_SIZE,
		fontFamily: Constants.LEAGUE_SPARTAN,
	},	
});

export default GameStatus;
