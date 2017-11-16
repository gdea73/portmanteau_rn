import React from 'react';
import {
	View,
	ScrollView,
	Button,
	Text,
	Image,
	StyleSheet
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import Board from '../components/TileBoard';
import Constants from '../etc/Constants';
import NavButton from '../components/NavButton';

const PADDING = 10;
const MARGIN = 5;
const BTN_HEIGHT = 40;
const PAGE_DELAY = 2000;
const N_PAGES = 3;

var { width, height } = require('Dimensions').get('window');
var pages = [
	{
		dropLetter: 'S',
		cols: [
			[' ', ' ', ' ', ' ', ' ', 'V', 'A'],
			[' ', ' ', ' ', ' ', 'Q', 'C', 'G'],
			[' ', ' ', ' ', ' ', ' ', 'A', 'H'],
			[' ', ' ', ' ', ' ', ' ', 'R', 'A'],
			[' ', ' ', ' ', ' ', ' ', ' ', ' '],
			[' ', ' ', ' ', ' ', ' ', ' ', 'T'],
			[' ', ' ', ' ', ' ', ' ', ' ', ' '],
		],
		text: 'The goal of Portmanteau is to drop tiles into the board in '
			+ 'order to form words. Words are broken when they are formed, and '
			+ 'longer words yield more points. The game ends when the board '
			+ 'becomes full. '
			+ 'Any adjacent tiles '
			+ '(vertically or horizontally) are read as a "word". By tapping '
			+ 'the right column, you can complete the word below, and it will '
			+ 'break. Notice, however, that the word "CAR" remains, because of '
			+ 'the "V" immediately next to it.\n'
			+ 'Some additional rules:\n'
			+ '· Words can be oriented in any way (left to right, top to'
			+ ' bottom, &c.).\n'
			+ '· Only words of 3 or more letters will be broken.\n'
			+ '· Letters have individual point values (similar to Scrabble).\n'
			+ '· The game ends when the board is filled with tiles.',
	}, {
		dropLetter: ' ',
		cols: [
			[' ', ' ', ' ', ' ', ' ', ' ', ' '],
			[' ', ' ', ' ', ' ', ' ', ' ', 'Q'],
			[' ', ' ', ' ', ' ', ' ', ' ', 'U'],
			[' ', ' ', ' ', ' ', ' ', ' ', 'A'],
			[' ', ' ', ' ', ' ', ' ', ' ', ' '],
			[' ', ' ', ' ', ' ', ' ', ' ', 'K'],
			[' ', ' ', ' ', ' ', ' ', ' ', ' '],
		],
		text: 'Occasionally, you will be given a "blank" instead of a static '
			+ 'letter to drop into the board. You can scroll horizontally to '
			+ 'find the desired letter, and then select it; then, it becomes '
			+ 'the new drop letter.',
	}, {
		dropLetter: 'T',
		cols: [
			[' ', ' ', ' ', ' ', ' ', 'R', 'A'],
			[' ', ' ', ' ', ' ', 'E', 'Q', 'Z'],
			[' ', ' ', ' ', ' ', 'A', 'X', 'A'],
			[' ', ' ', ' ', ' ', ' ', ' ', 'P'],
			[' ', ' ', ' ', ' ', ' ', ' ', ' '],
			[' ', ' ', ' ', ' ', ' ', ' ', ' '],
			[' ', ' ', ' ', ' ', ' ', ' ', ' '],
		],
		text: 'If you drop the "T" in the far left column, you can break '
			+ 'two words simultaneously. In addition, you can chain your '
			+ 'words, although this is difficult to plan. In this case, '
			+ '"ZAP" will break at chain level 2, since its isolation is a '
			+ 'direct consequence of "ART" breaking. More chains yield more '
			+ 'points. If you get a chain of 4 or greater, gimme a ring.',
	},
];
var page_text = [
	'Page 1 text.',
	'Page 2 text. (Blanks!)',
];

class InstructionScreen extends React.Component {
	static navigationOptions = {
		title: 'Instructions',
		header: null,
	};

	constructor(props) {
		super(props);
		this.page = 0;
		this.state = {
			...pages[this.page]
		}
		this.setPage = this.setPage.bind(this);
		this.moveComplete = this.moveComplete.bind(this);
	}

	setPage(newPage) {
		if (newPage < N_PAGES) {
			this.page = newPage;
			this.setState({...pages[newPage]});
		}
	}

	moveComplete() {
		this.timer = setTimeout(() => {
			this.setPage(this.page + 1);
		}, PAGE_DELAY);
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
	}

	render() {
		console.debug('rendering instructions screen; state:');
		console.debug(this.state);
		var instrHeight = height - 6 * MARGIN - (width
						/ Constants.BOARD_ASPECT_RATIO);
		return (
			<View style={styles.container}>
				<Image style={Constants.BG_IMAGE_STYLE}
					   source={require('../img/gradient_bg.png')} />
				<View
					style={[styles.instructionsContainer, {
						height: instrHeight,
					}]}>
					<View style={styles.buttonHeader}>
						<NavButton
							onPress={() => {
								if (this.page > 0) {
									this.setPage(this.page - 1);
								} else {
									this.props.navigation.goBack(null);
								}
							}}
							title="Go Back"
							height={BTN_HEIGHT}
							textStyle={{fontSize: 12}}
						/>
						<Text style={styles.titleText}>
							Instructions (page {this.page + 1} of {N_PAGES})
						</Text>
						<NavButton
							onPress={() => { this.setPage(this.page + 1); }}
							title="Continue"
							height={BTN_HEIGHT}
							disabled={this.page === N_PAGES - 1}
							textStyle={{fontSize: 12}}
						/>
					</View>
					<ScrollView
						contentContainerStyle={{padding: PADDING / 2}}
						style={{flex: 1}}
					>
						<Text style={styles.instructionText}>
							{this.state.text}
						</Text>
					</ScrollView>
				</View>
				<View style={styles.boardView}>
					{this.renderBoard()}
				</View>
			</View>
		);
	}

	renderBoard() {
		console.debug('rendering demo board (page ' + this.page + ')');
		return (
					<Board width={Math.floor(width - 2 * MARGIN)}
						   increaseScore={() => { }}
						   incrementMoveCount={() => { }}
						   addRecentWord={() => { }} 
						   initialCols={this.state.cols}
						   initialDropLetter={this.state.dropLetter}
						   key={'board-page' + this.page}
					/>
		);
	}
}

styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
	boardView: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		margin: MARGIN,
		aspectRatio: Constants.BOARD_ASPECT_RATIO,
		justifyContent: 'space-between',
	},
	instructionsContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		margin: MARGIN,
		padding: PADDING,
		backgroundColor: '#FFFFFF55',
		borderRadius: Constants.DEFAULT_BORDER_RAD,
	},
	instructionText: {
		fontSize: 18,
		textAlign: 'justify',
		fontFamily: 'Fanwood',
		color: 'white',
	},
	buttonHeader: {
		flex: 0, height: BTN_HEIGHT,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	titleText: {
		fontSize: 16,
		fontFamily: 'League Spartan-Bold',
		color: 'white',
	},
});

export default InstructionScreen;
