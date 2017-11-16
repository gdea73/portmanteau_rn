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

const BTN_HEIGHT = 40;

class HighScoreScreen extends React.Component {
	static navigationOptions = {
		title: 'High Scores',
		header: null,
	};

	constructor(props) {
		super(props);
		this.renderScores = this.renderScores.bind(this);
	}

	renderScores() {
		Storage.loadHighScores().then((scoresJSON) => {
			var scores = JSON.parse(scoresJSON);
			console.debug('read these scores from asyncstorage');
			console.debug(scores);
			var result = [];
			let i = Constants.N_HIGH_SCORES - 1;
			while (i >= 0 && scores[i].score !== 0) {
				result.push(
					<View style={styles.score}>
						<Text style={styles.scoreText}>{scores[i].score}</Text>
						<Text style={styles.scoreDate}>{scores[i].date}</Text>
					</View>
				);
			}
			return result;
		}).catch(() => {
			return (
				<Text style={styles.titleText}>Loading high scores failed</Text>
			);
		});
	}

	render() {
		return (
				<View style={styles.container}>
					<Image source={require('../img/gradient_bg.png')}
						   style={Constants.BG_IMAGE_STYLE}
					/>
					<View style={styles.scoresContainer}>
						<View style={{position: 'absolute', left: 0, top: 0}}>
							<NavButton
								onPress={() => {
									this.props.navigation.goBack(null)
								}}
								title="Go Back"
								textStyle={{fontSize: 12}}
								height={BTN_HEIGHT}
							/>
						</View>
						<View style={styles.header}>
							<Text style={styles.titleText}>HIGH SCORES</Text>
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
	header: {
		flex: 0, height: BTN_HEIGHT,
		margin: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	titleText: {
		fontSize: 16,
		fontFamily: 'League Spartan-Bold',
		color: 'white',
	},
	scoreText: {
		fontSize: 12,
		fontFamily: 'League Spartan-Bold',
		color: 'white',
	},
	scoreDate: {
		fontSize: 8,
		fontFamily: 'League Spartan-Bold',
		color: 'white',
	},
	scoreList: {
		flex: 1,
		margin: 10,
		backgroundColor: 'white',
		opacity: 0.3,
		borderRadius: Constants.DEFAULT_BORDER_RAD,
	},
});

export default HighScoreScreen;
