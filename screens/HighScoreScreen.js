import React from 'react';
import { StyleSheet, Alert, Button, Text, View, Image } from 'react-native';
import { StackNavigator } from 'react-navigation';

import Constants from '../etc/Constants';
import NavButton from '../components/NavButton';

class HighScoreScreen extends React.Component {
	static navigationOptions = {
		title: 'High Scores',
	};
	render() {
		return (
				<View style={styles.container}>
					<Image source={require('../img/gradient_bg.png')}
						   style={Constants.BG_IMAGE_STYLE}
					/>
					<View style={styles.scoresContainer}>
						<NavButton
							onPress={() => {this.props.navigation.goBack(null)}}
							title="Go Back"
						/>
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
});

export default HighScoreScreen;
