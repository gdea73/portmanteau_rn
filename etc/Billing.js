const inAppBilling = require('react-native-billing');

class Billing {
	static getInAppBilling() {
		console.debug('returning in app billing (android)');
		return inAppBilling;
	}
}

export default Billing;
