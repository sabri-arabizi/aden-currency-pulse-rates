package com.adenrates.currencyapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import com.adenrates.currencyapp.UnityAdsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Register the UniyAds plugin so JS can call native methods
        // Force Recompile 1
        registerPlugin(UnityAdsPlugin.class);
    }
}
