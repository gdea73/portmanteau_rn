import React from 'react';
import { Platform, NativeModules } from 'react-native';

const { StatusBarManager } = NativeModules;

const RECENT_WORDS_COUNT = 10;
const DEFAULT_BORDER_RAD = 4;
const TILE_PADDING = 3;
const BOARD_SIZE = 7;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
const LEAGUE_SPARTAN_FONT = Platform.OS === 'ios' ? 'League Spartan' : 'League Spartan-Bold';
const TITLE_IMAGE_ASPECT = 0.1040;
const TITLE_TEXT_PADDING = 20;
const BOARD_ASPECT_RATIO = 7/8.05; // slightly over 7/8 for padding
const N_HIGH_SCORES = 10;
const LEVEL_LENGTH = 25;
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
	static get BOARD_SIZE() {
		return BOARD_SIZE;
	}
	static get STATUS_BAR_HEIGHT() {
		return STATUS_BAR_HEIGHT;
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
	static LOGO_CONTAINER_STYLE(height)  {
		return {
			height: height - STATUS_BAR_HEIGHT
						   - TITLE_TEXT_PADDING,
			position: 'absolute',
			top: 0, left: 0,
			aspectRatio: Constants.TITLE_IMAGE_ASPECT,
		};
	}
}

export default Constants;
