import React from 'react';
import { StyleSheet, Alert, Button, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';

class MenuScreen extends React.Component {
	static navigationOptions = {
		title: 'PortmanteaU',
	};
	render() {
		return (
				<View style={styles.container}>
					<View style={styles.logoView}>
						<Text style={styles.heading}>PORTMANTEAU</Text>
					</View>
					<View style={styles.buttonView}>
						<Button
						onPress={() => {
							// Alert.alert('You did the right thing.')
							this.props.navigation.navigate('Game');
						}}
						title="Play"
						/>
						<Button
						onPress={() => { Alert.alert('You made the man happy.')}}
						title="Work"
						/>
						<Button
						onPress={() => { Alert.alert('You are the world champion.')}}
						title="High Scores"
						/>
					</View>
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

	logoView: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-around',
	},

	buttonView: {
		flex: 3,
		// alignItems: 'center',
		backgroundColor: '#deeede',
		paddingLeft: 40,
		paddingRight: 40,
		paddingTop: 10,
		paddingBottom: 10,
		justifyContent: 'space-between',
	},

	heading: {
		color: '#111133',
		fontSize: 30,
	},
});

export default MenuScreen;
