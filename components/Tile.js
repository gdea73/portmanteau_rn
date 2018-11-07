import React from 'react';
import {
	Platform,
	View,
	Text,
	StyleSheet,
	Animated,
} from 'react-native';

import Constants from '../etc/Constants';

// aesthetic constants
const TILE_FONT_RATIO = 0.45;
const ABSURDITY_RATIO = 1.8;

var tile_size, tile_font_size, tile_border_radius, screen_dependent_stile;
var is_tile_initialized = false;

class Tile extends React.Component {
	static set tile_size(size) {
		tile_size = size;
		tile_font_size = tile_size * TILE_FONT_RATIO;
		tile_border_radius = Math.floor(tile_size / 5);
		screen_dependent_stile = {
			height: tile_size,
				width: tile_size,
				borderRadius: tile_border_radius,
		};
		is_tile_initialized = true;
		Constants.d('tile size: ' + size);
	}

	static get tile_size() {
		return tile_size;
	}

	static get is_initialized() {
		return is_tile_initialized;
	}

	render() {
		var fontOffset = (1 - TILE_FONT_RATIO) / ABSURDITY_RATIO * tile_size;
		var text_style = [styles.tileText, {
			fontSize: tile_font_size,
			width: tile_size,
		}];
		if (Platform.OS == 'ios') {
			text_style.push({
				position: 'absolute',
				top: fontOffset,
			});
		}
		return(
			<Animated.View style={[styles.defaultStile,
					              screen_dependent_stile, this.props.style]}
						   onStartShouldSetResponder=
						   		{this.props.onSelect}>
										<Text style={text_style}>
											{this.props.letter}
										</Text>
			</Animated.View>
		);
	}
}

const styles = StyleSheet.create({
	tileText: {
		fontFamily: Constants.LEAGUE_SPARTAN,
		backgroundColor: 'transparent',
		color: 'white',
		textShadowColor: 'black',
		textShadowOffset: {width: -1.5, height: 2},
		alignSelf: 'center',
		textAlign: 'center',
	},
	tileTextContainer: {
		flex: 1,
		backgroundColor: '#000',
		justifyContent: 'center',
		alignItems: 'center',
	},
	defaultStile: {
		position: 'absolute',
		borderWidth: 1,
		borderColor: 'black',
		justifyContent: 'center',
	},
});

export default Tile;
