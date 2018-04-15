import React from 'react';
import {
	StyleSheet,
	Alert,
	Button,
	Text,
	View,
	Dimensions,
	BackHandler,
	Image
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Words from '../etc/Words';
import NavButton from '../components/NavButton';
import Constants from '../etc/Constants';
import Storage from '../etc/Storage';

const BUTTON_VIEW_PADDING = 40;

let {width, height} = Dimensions.get('window');

class MenuScreen extends React.Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
		super(props);
		this.state = {
			savedGamePresent: false,
			savedGameData: null,
		};
		this.loadSavedGame = this.loadSavedGame.bind(this);
		this.renderGameButton = this.renderGameButton.bind(this);
		this.backPress = this.backPress.bind(this);
	}

	componentWillMount() {
		this.loadSavedGame();
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.backPress);
	}

	backPress() {
		BackHandler.exitApp();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.backPress);
	}

	loadSavedGame() {
		console.debug('menu is trying to load saved game');
		Storage.loadGame().then((game) => {
			if (!game) {
				var state = this.state;
				state.savedGamePresent = false;
				state.savedGameData = null;
				this.setState(state);
				return;
			}
			console.debug('menu loaded saved game');
			var state = {
				savedGamePresent: true,
				savedGameData: JSON.parse(game),
			};
			this.setState(state);
		}).catch(() => {
			console.debug('menu could not load saved game');
			var state = this.state;
			state.savedGamePresent = false;
			state.savedGameData = null;
			this.setState(state);
		});
	}

	renderGameButton() {
		if (this.state.savedGamePresent) {
			return (
				<NavButton
					title="RESUME GAME"
					onPress={() => {
						this.props.navigation.navigate(
							'Game', {
								gameData: this.state.savedGameData,
								onSaveCallback: this.loadSavedGame,
								showAds: this.doShowAds(),
							},
						);
					}}
				/>
			);
		} else {
			return (
				<NavButton
					title="NEW GAME"
					onPress={() => {
						this.props.navigation.navigate(
							'Game', {
								onSaveCallback: this.loadSavedGame,
								showAds: this.doShowAds(),
							},
						);
					}}
				/>
			);
		}
	}

	doShowAds = () => {
		// for testing
		return true;
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
						{this.renderGameButton()}
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
