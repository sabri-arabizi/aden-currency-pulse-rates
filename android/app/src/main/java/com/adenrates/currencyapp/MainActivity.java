package com.adenrates.currencyapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
<<<<<<< HEAD
    // The Unity Ads plugin is now auto-registered by Capacitor.
    // No manual registration is needed in this file.
=======
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
>>>>>>> ed90887f85232ca4dd720f557048bd8155b0842f
}
