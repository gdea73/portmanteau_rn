import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	AsyncStorage,
	Animated,
	Image,
	Dimensions,
	BackHandler,
	Platform
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Constants from '../etc/Constants';
import Words from '../etc/Words';
import Root from '../config/router';

const LOADING_ANIMATION_DURATION = 800;
const LOAD_DELAY = 100;

let {width, height} = Dimensions.get('window');

class SplashScreen extends React.Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
		super(props);
		this.loadingOpacity = new Animated.Value(0.0);
		// keeps track of task completion; used like a barrier sync
		this.loadingTasks = {
			animation: false,
			dictionary: false,
			ads: false,
		};
		this.state = {
			isAppReady: false,
		};
	}

	async componentDidMount() {
		// start loading animation
		Animated.timing(
			this.loadingOpacity, {
				toValue: 1.0,
				duration: LOADING_ANIMATION_DURATION,
			}
		).start(() => { this.onTaskCompletion('animation'); });
		// load the dictionary
		Words.loadDictionary(() => { this.onTaskCompletion('dictionary') });
		// check whether ads should be shown / add removal can be purchased
		if (Platform.OS === 'android') {
			const InAppBilling = require('react-native-billing');
			await InAppBilling.close();
			InAppBilling.open()
				.then(() => InAppBilling.listOwnedProducts())
				.then(products => {
					console.debug(products);
					if (products.indexOf(Constants.AD_REMOVAL_PRODUCT) > -1) {
						Constants.showAds = false;
					} else {
						Constants.showAds = true;
					}
					console.debug('show ads? ' + Constants.showAds);
				})
				.catch(err => {
					console.error(err);
				}).finally(async () => {
					await InAppBilling.close();	
					this.onTaskCompletion('ads');
				});
		} else {
			Constants.showAds = true;
			// consider the 'ads' task complete, no IAP on iOS yet
			this.onTaskCompletion('ads');
		}
	}

	render() {
		console.debug('rendering SplashScreen');
		if (this.state.isAppReady) {
			console.debug('app loaded (exiting splash)');
			return (<Root />);
		}
		return (
				<View style={styles.container}>
					<Image source={require('../img/gradient_bg.png')}
						   style={Constants.BG_IMAGE_STYLE} />
					<View style={Constants.LOGO_CONTAINER_STYLE(height)}>
						<Image source={require('../img/title_text.png')}
							   style={Constants.LOGO_IMAGE_STYLE} />
					</View>
					<View style={styles.loading}>
						<Animated.Text style={[
							styles.loadingText,
							{ opacity: this.state.loadingOpacity }]}>
								LOADING
						</Animated.Text>
					</View>
			   </View>
			   );
	}

	onTaskCompletion = (task) => {
		console.debug('marking task "' + task + '" as complete');
		this.loadingTasks[task] = true;
		let appReady = true;
		Object.keys(this.loadingTasks).forEach((t) => {
			if (!this.loadingTasks[t]) {
				console.debug('task "' + t + '" not complete yet');
				appReady = false;
			}
		});
		if (!appReady) {
			return;
		}
		// everything has loaded; launch the app
		console.debug('SplashScreen: app is ready');
		var newState = this.state;
		newState.isAppReady = true;
		this.setState(newState);
	}

	dictLoadCallback = () => {
		if (this.animationComplete) {
			console.debug('animation loaded first; going to menu');
			// animation finished before loading the dictionary; go to menu
			this.setAppLoaded();
		}
		// otherwise, set the dictionaryLoaded flag so the animation callback
		// knows to load the menu when the animation is finished.
		this.dictionaryLoaded = true;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
	loading: {
		position: 'absolute',
		bottom: 0,
		right: 20,
	},
	loadingText: {
		color: 'white',
		fontFamily: Constants.LEAGUE_SPARTAN,
		textAlign: 'center',
		fontSize: 24,
	},
});

export default SplashScreen;
