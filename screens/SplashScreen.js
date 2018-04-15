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
		this.state = {
			animationDone: false,
			loadingOpacity: new Animated.Value(0.0),
		};
	}

	componentDidMount() {
		Animated.timing(
			this.state.loadingOpacity, {
				toValue: 1.0,
				duration: LOADING_ANIMATION_DURATION,
			}
		).start(() => {
			if (this.dictionaryLoaded) {
				// the dictionary was loaded before the animation finished
				console.debug('dictionary loaded first; going to menu');
				this.setAppLoaded();
			}
			// otherwise, set the animationComplete flag so the dictionary load
			// callback will load the menu before it terminates.
			this.animationComplete = true;
		});
		Words.loadDictionary(this.dictLoadCallback);
	}

	render() {
		console.debug('rendering SplashScreen');
		if (this.state.isAppLoaded) {
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

	setAppLoaded = () => {
		console.debug('going to menu');
		var newState = this.state;
		newState.isAppLoaded = true;
		this.setState(newState);
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
