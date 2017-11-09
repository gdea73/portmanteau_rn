import React from 'react';
import {
	StyleSheet,
	View,
	Text
} from 'react-native';

const TITLE_FONT_SIZE = 72;
const TITLE_PADDING = 40;

class TitleText extends React.Component {
	render() {
		return(
			<View style={styles.parentView}>
				<View style={styles.titleView}>
					<Text
						style={styles.titleText}
					>
						PORTMANTEAU
					</Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	parentView: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		width: TITLE_FONT_SIZE + TITLE_PADDING,
		backgroundColor: '#220000',
	},
	titleView: {
		backgroundColor: '#000022',
		transform: [{rotate: '90deg'}],
	},
	titleText: {
		color: 'white',
		fontSize: TITLE_FONT_SIZE,
		fontFamily: 'League Spartan',
	},
});

export default TitleText;
