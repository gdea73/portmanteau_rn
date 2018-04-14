import React from 'react';
import {
	StyleSheet,
	Button,
	Text,
	View,
	ScrollView,
	Image
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import NavButton from '../components/NavButton';
import Constants from '../etc/Constants';
import Storage from '../etc/Storage';

class HighScoreScreen extends React.Component {
	static navigationOptions = {
		title: 'High Scores',
		header: null,
	};

	constructor(props) {
		super(props);
		this.renderScores = this.renderScores.bind(this);
		this.state = {
			scoresLoaded: false,
			scores: null,
		};
	}

	renderScores() {
		if (!this.state.scores) {
			return [];
		}
		var result = [];
		let i = Constants.N_HIGH_SCORES - 1;
		while (i >= 0 && this.state.scores[i].score !== 0) {
			result.push(
				<View style={styles.score} key={'score' + i}>
					<Text style={[
						styles.scoreText, {textAlign: 'left', flex: 1}
					]}>
						{(Constants.N_HIGH_SCORES - i) + "."}
					</Text>
					<Text style={[
						styles.scoreText, {textAlign: 'right', flex: 2}
					]}>
						{this.state.scores[i].score}
					</Text>
					<Text style={[
						styles.scoreDate, {flex: 5
					}]}>
						{this.state.scores[i].date}
					</Text>
				</View>
			);
			i--;
		}
		return result;
	}

	componentWillMount() {
		Storage.loadHighScores().then((scoresJSON) => {
			var scores = JSON.parse(scoresJSON);
			this.setState({
				scoresLoaded: true,
				scores: scores,
			});
		});
	}

	render() {
		return (
			<View style={styles.container}>
				<Image source={require('../img/gradient_bg.png')}
					   style={Constants.BG_IMAGE_STYLE}
				/>
				<View style={styles.scoresContainer}>
					<View style={{
						...Constants.BTN_HEADER_STYLE, margin: 10
					}}>
						<NavButton
							onPress={() => {
								this.props.navigation.goBack(null)
							}}
							title="←"
							textStyle={{fontSize: 12}}
							height={Constants.BTN_HEIGHT}
							buttonStyle={Constants.NAV_BTN_STYLE}
							textStyle={Constants.NAV_BTN_FONT_STYLE}
						/>
						<Text style={Constants.HEADER_TEXT_STYLE}>
							HIGH SCORES
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
					<View style={styles.scoreList}>
						<ScrollView>
							{this.renderScores()}
						</ScrollView>
					</View>
				</View>
			</View>
	   );
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
	scoresContainer: {
		position: 'absolute',
		top: 0, left: 0, right: 0, bottom: 0,
	},
	scoreText: {
		fontSize: 16,
		fontFamily: Constants.LEAGUE_SPARTAN,
		color: 'white',
	},
	scoreDate: {
		flex: 3,
		fontSize: 12,
		fontFamily: Constants.LEAGUE_SPARTAN,
		color: 'white',
		textAlign: 'right',
	},
	scoreList: {
		flex: 1,
		margin: 10,
		backgroundColor: '#ffffff33',
		borderRadius: Constants.DEFAULT_BORDER_RAD,
	},
	score: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 8,
		borderBottomWidth: 1,
		borderColor: 'white',
	},
	innerScore: {
		flexDirection: 'row',
		flex: 1,
		justifyContent: 'space-between',
	}
});

export default HighScoreScreen;
