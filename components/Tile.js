import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Animated,
} from 'react-native';

import Constants from '../etc/Constants';

const TILE_FONT_SIZE = 18;

class Tile extends React.Component {
	state = {
		dropAnimation: 0,
	}

	componentDidUpdate() {

	}

	render() {
		var stile = { 
            backgroundColor: TILE_COLORS[this.props.letter],
            height: tileSize,
            width: tileSize,
            top: this.props.rowNo * (tileSize + TILE_PADDING),
            borderRadius: tileBorderRad,
            left: 0
        }

		<Animated.View style={[tileView, stile]}>
			<Text>{this.props.letter}</Text>
		</Animated.View>
	}
}

const styles = StyleSheet.create({
    tileView: {
        position: 'absolute',
        width: tileSize,
        height: tileSize,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
    },  

    tileText: {
        fontSize: TILE_FONT_SIZE,
        backgroundColor: 'transparent',
    }   
});

const TILE_COLORS = { 
    'A': '#c2efcb',
    'B': '#29d40e',
    'C': '#b3dc31',
    'D': '#6e6c81',
    'E': '#6da7c6',
    'F': '#ffdc33',
    'G': '#e6379f',
    'H': '#9bb04f',
    'I': '#515311',
    'J': '#fa0c8b',
    'K': '#7a094f',
    'L': '#34f978',
    'M': '#2b18a8',
    'N': '#58b76b',
    'O': '#0c4c6b',
    'P': '#4870ba',
    'Q': '#661f4d',
    'R': '#7fc737',
    'S': '#8b36d9',
    'T': '#71e385',
    'U': '#fd6831',
    'V': '#25b113',
    'W': '#98daf6',
    'X': '#507248',
    'Y': '#b34882',
    'Z': '#db482b',
    'BLANK': '#ffffff',
    'NONE': 'transparent',
};

export default Tile;
