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

const BUTTON_VIEW_PADDING = 40;

let {width, height} = Dimensions.get('window');

class MenuScreen extends React.Component {
	static navigationOptions = {
		header: null,
	};
	endDebounce() {
		console.debug('debouncing done');
		this.debounceActive = false;
	}
	render() {
		var logoHeight = height - Constants.STATUS_BAR_HEIGHT
								- Constants.TITLE_TEXT_PADDING;
		return (
				<View style={styles.container}>
					<Image source={require('../img/gradient_bg.png')}
						   style={Constants.BG_IMAGE_STYLE} />
					<View style={Constants.LOGO_CONTAINER_STYLE(height)}>
						<Image source={require('../img/title_text.png')}
							   style={Constants.LOGO_IMAGE_STYLE} />
					</View>
					<View style={[styles.buttonView, {
								width: width - (logoHeight * Constants.TITLE_IMAGE_ASPECT),
								height: logoHeight,
						  }
						  ]}>
						<NavButton
								title="NEW GAME"
								onPress={() => {
									this.props.navigation.navigate('Game');
								}}
						/>
						<NavButton
							onPress={() => {
								this.props.navigation.navigate('Instructions');
							}}
							title="INSTRUCTIONS"
						/>
						<NavButton
							onPress={() => {
								this.props.navigation.navigate('HighScores');
							}}
							title="HIGH SCORES"
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
	logoView: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-around',
	},
	buttonView: {
		position: 'absolute',
		top: 0, right: 0,
		backgroundColor: 'transparent',
		justifyContent: 'space-around',
		padding: BUTTON_VIEW_PADDING,
	},
	heading: {
		color: '#111133',
		fontSize: 30,
	},
});

export default MenuScreen;
