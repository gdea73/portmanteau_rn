import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	AsyncStorage,
	Animated,
	Image
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Constants from '../etc/Constants';
import Words from '../etc/Words';

const LOADING_ANIMATION_DURATION = 800;

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
					<Image source={require('../img/PMT_Splash.png')}
						   style={styles.bgImage} />
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
		Animated.timing(
			this.state.loadingOpacity, {
				toValue: 0.8,
				duration: LOADING_ANIMATION_DURATION,
			}
		).start(this.loadStuff.bind(this));
	}
	async loadStuff() {
		Words.loadDictionary(this.dictLoadCallback);
		this.loadHighScores(this.highScoresLoadCallback);
	}
	async loadHighScores(callback) {
		// TODO: load high scores here (promise from AsyncStorage)
		callback();
	}
	dictLoadCallback() {
		this.isDictLoaded = true;
		this.setLoadedIfDone();
	}
	highScoresLoadCallback() {
		this.areHighScoresLoaded = true;
		this.setLoadedIfDone();
	}
	setLoadedIfDone() {
		if (this.isDictLoaded && this.areHighScoresLoaded) {
				this.setState({
					isAppLoaded: true,
				});
			}
	}
	componentDidUpdate() {
		if (this.state.isAppLoaded) {
			this.props.navigation.navigate('Menu');
		}
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
		resizeMode: 'contain',
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
