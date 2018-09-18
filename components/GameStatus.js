import React from 'react';
import { View, ScrollView, StyleSheet, Text, Button } from 'react-native';
import { StackNavigator } from 'react-navigation';
import * as Progress from 'react-native-progress';

import Constants from '../etc/Constants';

const RECENT_WORD_DISPLAY_CACHE_SIZE = 25;
const RECENT_WORD_FONT_SIZE = 18;
const RECENT_WORD_FONT_WIDTH_RATIO = 0.8;
const PADDING = 3;
const BASE_LEVEL_THRESHOLD = 20;

class GameStatus extends React.Component {
	constructor(props) {
		super(props);
		var wordsBroken = [];
		if (props.initialStats) {
			this.state = props.initialStats;
			Constants.d('GameStatus received these initial stats:');
			Constants.d(props.initialStats);
		} else {
			this.state = {
				score: 0,
				moves: 0,
				tilesBroken: 0,
				wordsBrokenCount: 0,
				level: 1,
				lastLevelThreshold: 0,
				progress: 0.0,
				nextLevelThreshold: BASE_LEVEL_THRESHOLD,
				longestChain: 0,
				longestWord: 0,
				wordsBroken: wordsBroken,
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
			Constants.d('next longest chain level: ' + chainLevel);
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
		var newState = this.state;
		var wordsBroken = this.state.wordsBroken.slice();
		wordsBroken.push(word);
		if (word.length > this.state.longestWord) {
			newState.longestWord = word.length;
		}
		newState.wordsBroken = wordsBroken;
		this.setState(newState);
	}

	addTilesBrokenCount = (tilesBroken) => {
		var newState = this.state;
		newState.tilesBroken += tilesBroken;
		Constants.d('total tiles broken now ' + newState.tilesBroken);
		if (newState.tilesBroken > newState.nextLevelThreshold) {
			newState.level = this.state.level + 1;
			newState.lastLevelThreshold = newState.nextLevelThreshold;
			newState.nextLevelThreshold += BASE_LEVEL_THRESHOLD
				* Math.ceil(this.state.level / 2.0);
		}
		Constants.d('level threshold (' + newState.level + ') :'
			+ newState.nextLevelThreshold);
		newState.progress = (newState.tilesBroken - newState.lastLevelThreshold)
			/ (newState.nextLevelThreshold - newState.lastLevelThreshold);
		Constants.d('level progress: ' + newState.progress);
		this.setState(newState);
	}

	incrementWordsBrokenCount = () => {
		var newState = this.state;
		newState.wordsBrokenCount = this.state.wordsBrokenCount + 1;
		Constants.d('new words broken count: ' + newState.wordsBrokenCount);
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
				<View style={styles.wordsBrokenOuterContainer}>
					<Text style={styles.labelDefault}>Recent Words:</Text>
					<ScrollView style={[styles.wordsBrokenInnerContainer]}>
						{this.renderRecentWords()}
					</ScrollView>	
				</View>
			</View>
		);
	}

	renderRecentWords() {
		var wordsBroken = [];
		for (let i = RECENT_WORD_DISPLAY_CACHE_SIZE - 1; i >= 0; i--) {
			if (this.state.wordsBroken[i] === undefined) {
				continue
			}
			wordsBroken.push(
				<View key={'wordsBroken' + i}>
					<Text style={styles.recentWord}>{this.state.wordsBroken[i]}</Text>
				</View>
			);
		}
		return wordsBroken;
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
	wordsBrokenOuterContainer: {
		flex: 3,
		flexDirection: 'column',
		width: RECENT_WORD_FONT_SIZE * RECENT_WORD_FONT_WIDTH_RATIO * 7,
	},
	wordsBrokenInnerContainer: {
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
