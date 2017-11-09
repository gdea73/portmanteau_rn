import React from 'react';
import {
	StyleSheet,
	Alert,
	Button,
	Text,
	View,
	Dimensions,
	Image
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Words from '../etc/Words';
import NavButton from '../components/NavButton';
import Constants from '../etc/Constants';

let {width, height} = Dimensions.get('window');

class MenuScreen extends React.Component {
	static navigationOptions = {
		title: 'PortmanteaU',
	};
	endDebounce() {
		console.debug('debouncing done');
		this.debounceActive = false;
	}
	render() {
		return (
				<View style={styles.container}>
					<View
						style={{
							height: height - Constants.STATUS_BAR_HEIGHT
								- Constants.TITLE_TEXT_PADDING,
							position: 'absolute',
							top: 0, left: 0,
							aspectRatio: Constants.TITLE_IMAGE_ASPECT,
						}}
					>
						<Image source={require('../img/title_text.png')}
							   style={styles.titleImage} />
					</View>
					<View style={styles.buttonView}>
						<NavButton
							title="Play"
							onPress={() => {
								this.props.navigation.navigate('Game');
							}}
						/>
						<NavButton
						onPress={() => { Alert.alert('Try to make words out of tiles, and don\'t let the board fill up!')}}
						title="How to Play"
						/>
						<NavButton
						onPress={() => { Alert.alert('You are the world champion. (Until I implement a global scoreboard somehow.)')}}
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
		backgroundColor: 'black',
	},
	bgImage: {
		flex: 1,
		width: null,
		height: null,
		resizeMode: 'cover',
	},
	titleImage: {
		flex: 1,
		height: null,
		width: null,
		justifyContent: 'center',
	},
	logoView: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-around',
	},
	buttonView: {
		flex: 3,
		// alignItems: 'center',
		backgroundColor: '#222255',
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
