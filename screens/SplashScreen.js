import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	AsyncStorage,
	Animated,
	Image,
	Dimensions
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Constants from '../etc/Constants';
import Words from '../etc/Words';
import TitleText from '../components/TitleText';

const LOADING_ANIMATION_DURATION = 800;
const LOAD_DELAY = 100;
const TITLE_TEXT_PADDING = 50;

let {width, height} = Dimensions.get('window');

class SplashScreen extends React.Component {
	static navigationOptions = {
		title: 'Portmanteau (Loading...)',
	};
	constructor(props) {
		super(props);
		this.state = {
			isAppLoaded: false,
			loadingOpacity: new Animated.Value(0.0),
		};
		this.dictLoadCallback = this.dictLoadCallback.bind(this);
		this.highScoresLoadCallback = this.highScoresLoadCallback.bind(this);
	}
	render() {
		return (
				<View style={styles.container}>
					<Image source={require('../img/gradient_bg.png')}
						   style={styles.bgImage} />
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
		this.loadHighScores(this.highScoresLoadCallback);
	}
	async loadHighScores(callback) {
		// TODO: load high scores here (promise from AsyncStorage)
		callback();
	}
	dictLoadCallback() {
		console.debug('dictionary loaded (in splash screen callback)');
		this.isDictLoaded = true;
		this.setLoadedIfDone();
	}
	highScoresLoadCallback() {
		console.debug('high scores loaded (in splash screen callback)');
		this.areHighScoresLoaded = true;
		this.setLoadedIfDone();
	}
	setLoadedIfDone() {
		if (this.isDictLoaded && this.areHighScoresLoaded) {
			Animated.timing(
				this.state.loadingOpacity, {
					toValue: 1.0,
					duration: LOADING_ANIMATION_DURATION,
				}
			).start(() => { this.setState({ isAppLoaded: true, }); });
				
			}
	}
	componentDidUpdate() {
		if (this.state.isAppLoaded) {
			this.props.navigation.navigate('Menu');
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
