import React from 'react';
import {
	Platform,
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
							},
						);
					}}
				/>
			);
		}
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
						{this.renderAdRemovalButton()}
					</View>
					{this.renderError()}
					{this.renderMessage()}
				</View>
			   );
	}

	renderError = () => {
		if (this.state.error) {
			return (
				<View style={styles.errorView}>
					<Text style={styles.messageText}>{this.state.error}</Text>
				</View>
			);
		}
	}

	renderMessage = () => {
		if (this.state.message) {
			return (
				<View style={styles.messageView}>
					<Text style={styles.messageText}>{this.state.message}</Text>
				</View>
			);
		}
	}

	removeAds = () => {
		if (Platform.OS !== 'android') {
			return;
		}
		const InAppBilling = require('react-native-billing');
		InAppBilling.open()
			.then(() => InAppBilling.purchase(Constants.AD_REMOVAL_PRODUCT_ID))
			.then(details => {
				console.debug("Purchased: ", details);
				if (details.purchaseState === 'PurchasedSuccessfully') {
					Constants.showAds = false;
					this.showMessage(
						'Ads disabled. Thank you for supporting Portmanteau!'
					);
				} else {
					this.showError(
						'Unfortunately, the purchase could not be completed.'
					);
				}
			})
			.catch(err => {
				this.showError(err.toString());
				console.warn(err);
			}).finally(async () => {
				await InAppBilling.close()
			});
	}

	showError = (error) => {
		var newState = this.state;
		newState.error = error;
		this.setState(newState);
	}

	showMessage = (message) => {
		var newState = this.state;
		newState.message = message;
		this.setState(newState);
	}

	renderAdRemovalButton = () => {
		if (!Constants.showAds || Platform.OS !== 'android') {
			return null;
		}
		return (
			<NavButton onPress={this.removeAds} title="REMOVE ADS" />
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
	errorView: {
		backgroundColor: '#880000AA',
	},
	messageView: {
		backgroundColor: '#000000AA',
	},
	messageText: {
		color: 'white',
		fontSize: 18,
		textAlign: 'center',
		textShadowColor: 'black',
		textShadowOffset: {width: -0.75, height: 1},
	},
});

export default MenuScreen;
