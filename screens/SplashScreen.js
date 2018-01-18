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
			backgrounded: false,
		};
		this.dictLoadCallback = this.dictLoadCallback.bind(this);
	}

	componentDidMount() {
		console.debug('SplashScreen did mount');
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
			).start(() => {
				var state = this.state;
				state.isAppLoaded = true;
				this.setState(state);
			});
		}
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
		fontFamily: 'Constants.LEAGUE_SPARTAN',
		textAlign: 'center',
		fontSize: 24,
	},
});

export default SplashScreen;
