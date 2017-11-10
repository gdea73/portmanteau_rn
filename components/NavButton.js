import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
} from 'react-native';

import Constants from '../etc/Constants';

const DEBOUNCE_DELAY = 500;
const NAV_BTN_HEIGHT = 50;

class NavButton extends React.Component {
	constructor(props) {
		super(props);
		if (!props.height) {
			this.height = NAV_BTN_HEIGHT;
		} else {
			this.height = props.height;
		}
		this.state = { enabled: true };
	}

	render() {
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
				<View style={[styles.button, {
								height: this.height,
								borderRadius: this.height / 2,
							}]}>
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
		justifyContent: 'center',
	},
	buttonText: {
		color: 'white',
		justifyContent: 'center',
		fontSize: 24,
		textAlign: 'center',
	},
});

export default NavButton;
