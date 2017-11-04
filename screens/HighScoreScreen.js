import React from 'react';
import { StyleSheet, Alert, Button, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';

import Constants from '../etc/Constants';

class HighScoreScreen extends React.Component {
	static navigationOptions = {
		title: 'High Scores',
	};
	render() {
		return (
				<View style={styles.container}>
						<Button
						onPress={() => {this.props.navigation.goBack(null)}}
						title="Go Back"
						/>
				</View>
			   );
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#efffef',
		padding: 10,
	},
});

export default HighScoreScreen;
