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
		if (props.disabled) {
			this.state = { enabled: false };
		} else {
			this.state = { enabled: true };
		}
	}

	render() {
		var buttonStyle = [{
				borderRadius: this.height / 2
			},
			styles.button, {
				height: this.height,
			}];
		if (this.props.buttonStyle) {
			buttonStyle.push(this.props.buttonStyle);
		}
		if (!this.state.enabled) {
			buttonStyle.push({opacity: 0.2});
		}
		var textStyle = [];
		textStyle.push(styles.buttonText);
		if (this.props.textStyle) {
			textStyle.push(this.props.textStyle);
		}
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
				<View style={buttonStyle}>
					<Text style={textStyle}>{this.props.title}</Text>
				</View>
			</TouchableOpacity>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
	}
}

const styles = StyleSheet.create({
	button: {
		borderColor: 'white',
		borderWidth: 2,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		padding: 4,
	},
	buttonText: {
		color: 'white',
		justifyContent: 'center',
		fontSize: 18,
		textAlign: 'center',
		fontFamily: Constants.LEAGUE_SPARTAN,
	},
});

export default NavButton;
