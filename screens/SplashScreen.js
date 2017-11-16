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
const TITLE_TEXT_PADDING = 50;

let {width, height} = Dimensions.get('window');

class SplashScreen extends React.Component {
	static navigationOptions = {
		header: null,
	};
	constructor(props) {
		super(props);
		this.state = {
			isAppLoaded: false,
			loadingOpacity: new Animated.Value(0.0),
		};
		this.dictLoadCallback = this.dictLoadCallback.bind(this);

		// added for BackHandler
		// adapted from
		// https://github.com/react-community/react-navigation/issues/1819
		this.backButtonListener = null;
		this.currentRoute = 'Menu';
		this.lastBackButtonPress = null;
	}
	/* onNavigationStateChange={(prev, current, action) => {
		let prevRouteName = prev.routes[prev.index].routeName;
		let routeName = current.routes[current.index].routeName;
		console.debug('navigation state change from ' + prevRouteName + ' to ' + routeName);
		if (prevRouteName === 'Game' && routeName === 'Menu') {
			console.debug('loading saved game from AsyncStorage');
		}
	}} */
	render() {
		if (this.state.isAppLoaded) {
			console.debug('app loaded (exiting splash)');
			return (
				<Root
				/>
			);
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
								Loading
						</Animated.Text>
					</View>
			   </View>
			   );
	}
	componentDidMount() {
		Words.loadDictionary(this.dictLoadCallback);
	}
	dictLoadCallback() {
		console.debug('dictionary loaded (in splash screen callback)');
		this.isDictLoaded = true;
		this.setLoadedIfDone();
	}
	setLoadedIfDone() {
		if (this.isDictLoaded) {
			Animated.timing(
				this.state.loadingOpacity, {
					toValue: 1.0,
					duration: LOADING_ANIMATION_DURATION,
				}
			).start(() => { this.setState({ isAppLoaded: true, }); });
		}
	}
	componentWillUnmount() {
		clearTimeout(this.timer);
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
		textAlign: 'center',
		fontSize: 24,
	},
});

export default SplashScreen;
