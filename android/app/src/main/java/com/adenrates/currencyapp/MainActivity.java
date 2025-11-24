package com.adenrates.currencyapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.unity3d.ads.UnityAds;

public class MainActivity extends BridgeActivity {
    String unityGameID = "5967793";
    Boolean testMode = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Register the UnityAds plugin so JS can call native methods
        registerPlugin(UnityAdsPlugin.class);
        // Initialize the Unity Ads SDK
        UnityAds.initialize(getApplicationContext(), unityGameID, testMode);
    }
}
