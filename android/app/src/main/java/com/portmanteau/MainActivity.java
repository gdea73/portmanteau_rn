package com.portmanteau;

import com.facebook.react.ReactActivity;
import com.google.android.gms.ads.MobileAds;
import android.os.Bundle;

public class MainActivity extends ReactActivity {
	private static final String ADMOB_APP_ID = "ca-app-pub-8559716447664382/7140833780";

	protected void onCreate(Bundle savedInstancestate) {
		super.onCreate(savedInstancestate);
		MobileAds.initialize(this, ADMOB_APP_ID);
	}

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Portmanteau";
    }
}
