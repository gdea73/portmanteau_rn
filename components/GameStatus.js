import React from 'react';
import { View, ScrollView, StyleSheet, Text, Button } from 'react-native';
import { StackNavigator } from 'react-navigation';

import Constants from '../etc/Constants';

// const RECENT_WORDS_VISIBLE = 5;
const RECENT_WORD_CACHE_SIZE = 14;
const RECENT_WORD_FONT_SIZE = 18;
const RECENT_WORD_FONT_WIDTH_RATIO = 0.8;
const RECENT_WORD_SPACING = 1.35;
const PADDING = 3;

var { width, height } = require('Dimensions').get('window');

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

	render() {
		return(
			<View style={styles.statusView}>
				<View style={{flexDirection: 'column', flex: 1}}> 
					<Text style={styles.score}>{this.state.score}</Text>
					<Text style={styles.level}>
						LEVEL: {Math.floor(this.state.moves / Constants.LEVEL_LENGTH + 1)}
					</Text>
				</View>
				<View style={{
					flexDirection: 'column', flex: 1,
					width: RECENT_WORD_FONT_SIZE * RECENT_WORD_FONT_WIDTH_RATIO * 7,
					// height: RECENT_WORDS_VISIBLE * RECENT_WORD_FONT_SIZE * RECENT_WORD_SPACING,
				}}>
					<Text style={styles.recentWordsLabel}>Recent Words:</Text>
					<ScrollView style={[styles.viewDefault, styles.recentWordsContainer]}>
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
    statusView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#bbdfef77',
        padding: PADDING,
		marginBottom: Constants.UI_PADDING,
		borderRadius: Constants.DEFAULT_BORDER_RAD,
		flex: 1,
    },
	score: {
		color: 'white',
		fontSize: 30,
		fontFamily: Constants.LEAGUE_SPARTAN,
	},
	level: {
		color: 'white',
		fontSize: 15,
		fontFamily: Constants.LEAGUE_SPARTAN,
	},
	recentWordsLabel: {
		color: 'white',
		fontSize: 15,
		fontFamily: Constants.LEAGUE_SPARTAN,
	},
	recentWordsContainer: {
		flex: 1,
		backgroundColor: '#332222',
		borderRadius: Constants.DEFAULT_BORDER_RAD,
	},
	recentWord: {
		color: 'white',
		fontSize: RECENT_WORD_FONT_SIZE,
		fontFamily: Constants.LEAGUE_SPARTAN,
	},	
});

export default GameStatus;
