import React from 'react';
import { Platform, NativeModules } from 'react-native';

const { StatusBarManager } = NativeModules;

const RECENT_WORDS_COUNT = 10;
const DEFAULT_BORDER_RAD = 4;
const TILE_PADDING = 3;
const UI_PADDING = 10;
// BOARD_SIZE here for readability, changing this still breaks everything
const BOARD_SIZE = 7;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
const LEAGUE_SPARTAN = Platform.OS === 'ios' ? 'League Spartan' : 'League Spartan-Bold';
const TITLE_IMAGE_ASPECT = 0.1040;
const TITLE_TEXT_PADDING = 40;
const BOARD_ASPECT_RATIO = 7/8.05; // slightly over 7/8 for padding
const N_HIGH_SCORES = 50;
const LEVEL_LENGTH = 25;
const MIN_WORD_LENGTH = 3;

// background color for Board and GameStatus container Views
const COMPONENT_BG_COLOR = '#FFFFFF' + 'AA' /* alpha */;

var BG_IMAGE_STYLE = {
	flex: 1,
	width: null,
	height: null,
	resizeMode: 'cover',
};
var LOGO_IMAGE_STYLE = {
	flex: 1,
	height: null,
	width: null,
};
const BTN_HEIGHT = 30;
const BTN_WIDTH = 40;
var BTN_HEADER_STYLE = {
	flex: 0, height: BTN_HEIGHT,
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
};
var HEADER_TEXT_STYLE = {
	fontSize: 16,
	textAlign: 'center',
	fontFamily: LEAGUE_SPARTAN,
	color: 'white',
	flex: 1,
};
var NAV_BTN_STYLE = {
	width: BTN_WIDTH, borderWidth: 0, padding: 0, top: 0,
	margin: 0, alignItems: 'center',
};
var NAV_BTN_FONT_STYLE = {
	fontFamily: LEAGUE_SPARTAN,
	fontSize: 24,
}

class Constants {
	static get RECENT_WORDS_COUNT() {
		return RECENT_WORDS_COUNT;
	}
	static get DEFAULT_BORDER_RAD() {
		return DEFAULT_BORDER_RAD;
	}
	static get TILE_PADDING() {
		return TILE_PADDING;
	}
	static get UI_PADDING() {
		return UI_PADDING;
	}
	static get BOARD_SIZE() {
		return BOARD_SIZE;
	}
	static get STATUS_BAR_HEIGHT() {
		return STATUS_BAR_HEIGHT;
	}
	static get LEAGUE_SPARTAN() {
		return LEAGUE_SPARTAN;
	}
	static get TITLE_IMAGE_ASPECT() {
		return TITLE_IMAGE_ASPECT;
	}
	static get TITLE_TEXT_PADDING() {
		return TITLE_TEXT_PADDING;
	}
	static get BG_IMAGE_STYLE() {
		return BG_IMAGE_STYLE;
	}
	static get BOARD_ASPECT_RATIO() {
		return BOARD_ASPECT_RATIO;
	}
	static get LOGO_IMAGE_STYLE() {
		return LOGO_IMAGE_STYLE;
	}
	static get N_HIGH_SCORES() {
		return N_HIGH_SCORES;
	}
	static get LEVEL_LENGTH() {
		return LEVEL_LENGTH;
	}
	static get MIN_WORD_LENGTH() {
		return MIN_WORD_LENGTH;
	}
	static get COMPONENT_BG_COLOR() {
		return COMPONENT_BG_COLOR;
	}
	static LOGO_CONTAINER_STYLE(height)  {
		return {
			height: height - STATUS_BAR_HEIGHT
						   - TITLE_TEXT_PADDING,
			position: 'absolute',
			top: 0, left: 0,
			aspectRatio: Constants.TITLE_IMAGE_ASPECT,
		};
	}
	static get BTN_HEIGHT() {
		return BTN_HEIGHT;
	}
	static get BTN_WIDTH() {
		return BTN_WIDTH;
	}
	static get BTN_HEADER_STYLE() {
		return BTN_HEADER_STYLE;
	}
	static get HEADER_TEXT_STYLE() {
		return HEADER_TEXT_STYLE;
	}
	static get NAV_BTN_STYLE() {
		return NAV_BTN_STYLE;
	}
	static get NAV_BTN_FONT_STYLE() {
		return NAV_BTN_FONT_STYLE;
	}
}

export default Constants;
