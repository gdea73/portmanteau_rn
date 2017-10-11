import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { StackNavigator } from 'react-navigation';

import Constants from '../etc/Constants';

const RECENT_WORDS_VISIBLE = 5;
const RECENT_WORD_SIZE = 14;
const RECENT_WORD_SPACING = 1.25;
const PADDING = 3;

var { width, height } = require('Dimensions').get('window');

class GameStatus extends React.Component {
	constructor(props) {
		super(props);
		recentWords = [];
		for (let i = 0; i < RECENT_WORD_SIZE; i++) {
			recentWords.push('');
		}
		this.state = {
			score: 0,
			moves: 0,
			highestChain: 0,
			words: recentWords,
		};
	}

	// these functions allow the parent to access its GameScreen component
	// and the member functions
	componentDidMount() {
		this.props.onRef(this);
	}
	componentWillUnmount() {
		this.props.onRef(undefined);
	}

	increaseScore(points, chainLevel) {
		var newState = this.state;
		newState['score'] = this.state['score'] + points;
		if (chainLevel > this.state['highestChain']) {
			newState['highestChain'] = chainLevel;
		}
		this.setState(newState);
	}

	incrementMoveCount() {
		var newState = this.state;
		newState['moves'] = this.state['moves'] + 1;
		this.setState(newState);
	}

	addRecentWord(word) {
		var recentWords = this.state['recentWords'].slice();
		for (let i = RECENT_WORD_SIZE - 1; i > 0; i--) {
			recentWords[i] = recentWords[i - 1];
		}
		recentWords[0] = word;
		var newState = this.state;
		newState['recentWords'] = recentWords;
		this.setState(newState);
	}

	render() {
		return(
			<View style={styles.statusView}>
				<View style={{flexDirection: 'column', paddingRight: (width - 2 * PADDING) / 2}}> 
					<Text style={styles.score}>{this.state.score}</Text>
					<Text style={styles.moves}>Moves: {this.state.moves}</Text>
				</View>
				<ScrollView style={[styles.viewDefault, styles.recentWordsContainer]}>
					{this.renderRecentWords()}
				</ScrollView>	
			</View>
		);
	}

	renderRecentWords() {
		var recentWords = [];
		for (let i = 0; i < Constants.recentWordsCount; i++) {
			recentWords.push(
				<View key={'recentWords' + i}>
					<Text style={styles.recentWord}>{this.state.words[i]}</Text>
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
        backgroundColor: '#bbdfef',
        padding: PADDING,
		borderRadius: Constants.defaultBorderRad,
    },
	score: {
		color: '#111133',
		fontSize: 30,
	},
	moves: {
		color: '#111133',
		fontSize: 15,
	},
	recentWordsContainer: {
		height: RECENT_WORDS_VISIBLE * RECENT_WORD_SIZE * RECENT_WORD_SPACING,
		backgroundColor: '#332222',
		borderRadius: Constants.defaultBorderRad,
	},
	recentWord: {
		color: 'white',
		fontSize: RECENT_WORD_SIZE,
	},	
});

export default GameStatus;
