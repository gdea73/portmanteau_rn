import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
} from 'react-native';

import Constants from '../etc/Constants';

const DEBOUNCE_DELAY = 500;

class NavButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = { enabled: true };
	}

	render() {
	// TODO: dynamic styles: border radius 1/2 height; font size appropriate
	// try allowFontScaling={true}
		console.debug('button height: ' + this.props.height);
		return(
			<TouchableOpacity
				onPress={() => {
					if (this.state.enabled) {
						this.setState({enabled: false});	
						this.props.onPress();
					}
					this.timer = setTimeout(
						() => {
							this.setState({enabled: true})
						}, DEBOUNCE_DELAY
					);
				}}
			>
				<View
					style={[
						styles.button,
						{borderRadius: 2}
					]}
				>
					<Text style={styles.buttonText}>{this.props.title}</Text>
				</View>
			</TouchableOpacity>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.debounceTimer);
	}
}

const styles = StyleSheet.create({
	button: {
		borderColor: 'white',
		borderWidth: 2,
		backgroundColor: 'transparent',
	},
	buttonText: {
		color: 'white',
		justifyContent: 'center',
	},
});

export default NavButton;
