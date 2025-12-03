package com.adenrates.currencyapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.unity3d.ads.UnityAds;
import com.adenrates.currencyapp.UnityAdsPlugin;

public class MainActivity extends BridgeActivity {
    String unityGameID = "5967793";
    Boolean testMode = false;
    String bannerPlacement = "Banner_Android";
    String interstitialPlacement = "Interstitial_Android";
    String rewardedVideoPlacement = "Rewarded_Android";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Register the UnityAds plugin so JS can call native methods
        registerPlugin(UnityAdsPlugin.class);
        // Initialize the Unity Ads SDK
        UnityAds.initialize(getApplicationContext(), unityGameID, testMode);
    }
}
