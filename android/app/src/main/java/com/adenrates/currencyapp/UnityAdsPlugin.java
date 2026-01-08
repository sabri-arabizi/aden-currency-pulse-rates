package com.adenrates.currencyapp;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "UnityAds")
public class UnityAdsPlugin extends Plugin {

    @Override
    public void load() {
        android.util.Log.d("AdenUnityAds", "Plugin Loaded/Initialized");
    }

    @PluginMethod
    public void showBanner(PluginCall call) {
        android.util.Log.d("AdenUnityAds", "showBanner called from JS");
        getActivity().runOnUiThread(() -> {
            // Using "Banner_Android" as hardcoded ID since it is common
            UnityAdsHelper.getInstance().showBanner(getActivity(), "Banner_Android");
            call.resolve();
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            UnityAdsHelper.getInstance().showInterstitial(getActivity(), "Interstitial_Android");
            call.resolve();
        });
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            UnityAdsHelper.getInstance().showRewarded(getActivity(), "Rewarded_Android", () -> {
                // Reward logic here if needed, currently just showing
            });
            call.resolve();
        });
    }
}
