import React from 'react';
import {
	ScrollView,
	View,
	StyleSheet,
	Text,
	Image,
	BackHandler,
} from 'react-native';
import Tile from '../components/Tile';
import Words from '../etc/Words';
import NavButton from '../components/NavButton';
import Storage from '../etc/Storage';
import Constants from '../etc/Constants';

var { width, height } = require('Dimensions').get('window');

const DICT_MODE_BUTTON_HEIGHT = 30;

class DictionaryScreen extends React.Component {
	static navigationOptions = {
		header: null,
	};

	constructor(props) {
		super(props);
		this.first_letters_broken = [];
		for (let l = 0; l < 26; l++) {
			this.first_letters_broken = false;	
		}
		this.state = {
			page: 'A',
			words_broken_loaded: false,
			words_broken: null,
			dict_mode: 'ALL',
		}
	}

	backPress = () => {
		this.props.navigation.goBack(null);
		return true;
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.backPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.backPress);
	}

	setPage = (letter) => {
		if (this.state.page === letter) {
			return;
		}
		var new_state = this.state;
		new_state.page = letter;
		this.setState(new_state);
	}

	renderNavTiles = () => {
		var tiles = [];

		for (let l = 'A'; l <= 'Z'; l = String.fromCharCode(l.charCodeAt(0) + 1)) {
			let backgroundColor = Constants.TILE_UNSELECTED_COLOR;
			if (this.first_letters_broken[l]) {
				backgroundColor = Constants.TILE_COLORS[l];
			}
			let stile = {
				backgroundColor: backgroundColor,
				flex: 1,
				height: Tile.tile_size,
				width: Tile.tile_size,
			};
			tiles.push(
				<Tile key={'nav' + l} style={stile} onPress={() => {this.setPage(l)}} letter={l} />
			);
		}
		return tiles
	}

	renderDictPage = () => {
		if (!this.state.words_broken) {
			return [];
		}

		var words = [];

		var start_idx = Words.binSearch(this.state.page);
		if (this.state.page === 'Z') {
			var end_idx = Words.dictionary.length;
		} else {
			var end_idx = Words.binSearch(String.fromCharCode(this.state.page.charCodeAt(0) + 1));
		}
		Constants.d('page ' + this.state.page + '; [' + start_idx + ', ' + end_idx + ']');

		for (let i = start_idx; i < end_idx; i++) {
			words.push(<Text key={'dict' + Words.dictionary[i]}>{Words.dictionary[i]}</Text>);
		}

		Constants.d('words: ' + words);
		return words;
	}
	
	// I'm on an airplane and I don't know what the JS builtin is for this, or
	// whether one exists, so I'll just make one for now.
	reverse = (string) => {
		var reversed = '';
		for (let i = 0; i < string.length; i++) {
			reversed = string[i] + reversed;
		}
		return reversed;
	}

	componentWillMount() {
		if (!Tile.is_initialized) {
			var boardWidth = Math.floor(width - 2 * Constants.UI_PADDING);
			Tile.tile_size = (boardWidth - (Constants.BOARD_SIZE + 1)
				* Constants.TILE_PADDING)
				/ Constants.BOARD_SIZE;
		}
		Storage.load_words_broken().then((words_broken_JSON) => {
			var words_broken = JSON.parse(words_broken_JSON);
			for (let i = words_broken.length - 1; i >= 0; i--) {
				words_broken.push(this.reverse(words_broken[i]));
				this.first_letters_broken[words_broken[0]] = true;
			}
			words_broken.sort();
			Constants.d('words broken: ' + words_broken);
			this.setState({
				words_broken_loaded: true,
				words_broken: words_broken,
			});
		});
	}

	render() {
		var navTileViewWidth = {
			maxWidth: Tile.tile_size,
			minWidth: Tile.tile_size,
		}
		return (
			<View style={Constants.DEFAULT_CONTAINER_STYLE}>
				<Image style={Constants.BG_IMAGE_STYLE}
					   source={require('../img/gradient_bg.png')} />
				<View style={styles.container}>
					<View style={Constants.BTN_HEADER_STYLE}>
						<NavButton
							onPress={this.backPress}
							title="←"
							textStyle={{fontSize: 12}}
							height={Constants.BTN_HEIGHT}
							buttonStyle={Constants.NAV_BTN_STYLE}
							textStyle={Constants.NAV_BTN_FONT_STYLE}
						/>
						<Text style={Constants.HEADER_TEXT_STYLE}>
							DICTIONARY
						</Text>
						<NavButton
							onPress={() => { }}
							title="←"
							textStyle={{fontSize: 12}}
							height={Constants.BTN_HEIGHT}
							buttonStyle={Constants.NAV_BTN_STYLE}
							textStyle={{color: 'transparent'}}
						/>
					</View>
					<View style={{flexDirection: 'row', flex: 1}}>
						<View style={[styles.navTileView, navTileViewWidth]}>
							{this.renderNavTiles()}
						</View>
						<ScrollView style={styles.dictPageView}>
							<View style={styles.dictModeButtonContainer}>
								<NavButton
									onPress={() => {
										if (this.state.dict_mode !== 'BROKEN') {
											var new_state = this.state;
											new_state.dict_mode = 'BROKEN';
											this.setState(new_state);
										}
									}}
									title="BROKEN"
									textStyle={{fontSize: 12}}
									height={DICT_MODE_BUTTON_HEIGHT}
									buttonStyle={[styles.dictModeButton, {
										borderTopRightRadius: 0,
										borderBottomRightRadius: 0,
										borderRightWidth: 1,
										borderTopLeftRadius: DICT_MODE_BUTTON_HEIGHT / 4,
										borderBottomLeftRadius: DICT_MODE_BUTTON_HEIGHT / 4,
									}]}
								/>
								<NavButton
									onPress={() => {
										if (this.state.dict_mode !== 'ALL') {
											var new_state = this.state;
											new_state.dict_mode = 'ALL';
											this.setState(new_state);
										}
									}}
									title="ALL"
									textStyle={{fontSize: 12}}
									height={DICT_MODE_BUTTON_HEIGHT}
									buttonStyle={[styles.dictModeButton, {
										borderTopLeftRadius: 0,
										borderBottomLeftRadius: 0,
										borderLeftWidth: 1,
										borderTopRightRadius: DICT_MODE_BUTTON_HEIGHT / 4,
										borderBottomRightRadius: DICT_MODE_BUTTON_HEIGHT / 4,
									}]}
								/>
							</View>
							{this.renderDictPage()}
						</ScrollView>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0, left: 0, right: 0, bottom: 0,
	},
	navTileView: {
		flex: 1,
		marginTop: Constants.UI_PADDING,
		marginLeft: Constants.UI_PADDING,
		marginBottom: Constants.UI_PADDING,
		backgroundColor: '#00000044',
		borderRadius: Constants.DEFAULT_BORDER_RAD,
		flexDirection: 'column',
	},
	dictPageView: {
		margin: Constants.UI_PADDING,
		flex: 1,
		backgroundColor: '#00000044',
		borderRadius: Constants.DEFAULT_BORDER_RAD,
		flexDirection: 'column',
	},
	dictModeButtonContainer: {
		flex: 0,
		top: 0,
		left: 0,
		right: 0,
		height: DICT_MODE_BUTTON_HEIGHT,
		justifyContent: 'center',
		flexDirection: 'row',
	},
	dictModeButton: {
		borderColor: 'white',
		borderWidth: 2,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		padding: 4,
	},
});

export default DictionaryScreen;
