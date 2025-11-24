package com.adenrates.currencyapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		// Register the UnityAds plugin so JS can call native methods
		registerPlugin(UnityAdsPlugin.class);
	}
}
