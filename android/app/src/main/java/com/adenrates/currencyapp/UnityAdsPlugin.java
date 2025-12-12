package com.adenrates.currencyapp;

import android.app.Activity;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;
import com.unity3d.services.banners.BannerErrorInfo;
import com.unity3d.services.banners.BannerView;
import com.unity3d.services.banners.UnityBannerSize;

@CapacitorPlugin(name = "UnityAds")
public class UnityAdsPlugin extends Plugin {
    private static final String TAG = "UnityAdsPlugin";
    private BannerView bannerView;
    private RelativeLayout bannerLayout;

    @PluginMethod
    public void initialize(PluginCall call) {
        String gameId = call.getString("gameId");
        boolean testMode = call.getBoolean("testMode", true); // Default to true for debugging if missing
        
        if (UnityAds.isInitialized()) {
            JSObject ret = new JSObject();
            ret.put("initialized", true);
            call.resolve(ret);
            return;
        }

        getActivity().runOnUiThread(() -> {
            UnityAds.initialize(getContext(), gameId, testMode, new IUnityAdsInitializationListener() {
                @Override
                public void onInitializationComplete() {
                    JSObject ret = new JSObject();
                    ret.put("initialized", true);
                    notifyListeners("unityAdsInitialized", ret);
                    
                    // User Feedback
                    Toast.makeText(getContext(), "Unity Ads Initialized (Test Mode: " + testMode + ")", Toast.LENGTH_SHORT).show();
                    
                    try {
                        call.resolve(ret);
                    } catch (Exception e) {
                        // ignore if call already handled
                    }
                }

                @Override
                public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
                    JSObject ret = new JSObject();
                    ret.put("initialized", false);
                    ret.put("message", message);
                    notifyListeners("unityAdsInitializationFailed", ret);
                    
                    // User Feedback
                    Toast.makeText(getContext(), "Unity Ads Init Failed: " + message, Toast.LENGTH_LONG).show();
                    Log.e(TAG, "Unity Ads Init Failed: " + message);

                    try {
                        call.reject(message);
                    } catch (Exception e) {
                        // ignore
                    }
                }
            });
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        String placementId = call.getString("placement");
        loadAndShowAd(placementId, call, false);
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        String placementId = call.getString("placement");
        loadAndShowAd(placementId, call, true);
    }

    private void loadAndShowAd(String placementId, PluginCall call, boolean isRewarded) {
        getActivity().runOnUiThread(() -> {
            UnityAds.load(placementId, new IUnityAdsLoadListener() {
                @Override
                public void onUnityAdsAdLoaded(String placementId) {
                    UnityAds.show(getActivity(), placementId, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                        @Override
                        public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {
                            JSObject ret = new JSObject();
                            ret.put("placement", placementId);
                            ret.put("error", message);
                            notifyListeners("unityAdsShowFailed", ret);
                            Toast.makeText(getContext(), "Ad Show Failed: " + message, Toast.LENGTH_SHORT).show();
                        }

                        @Override
                        public void onUnityAdsShowStart(String placementId) {
                            JSObject ret = new JSObject();
                            ret.put("placement", placementId);
                            notifyListeners("unityAdsShowStart", ret);
                        }

                        @Override
                        public void onUnityAdsShowClick(String placementId) {
                            JSObject ret = new JSObject();
                            ret.put("placement", placementId);
                            notifyListeners("unityAdsShowClick", ret);
                        }

                        @Override
                        public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                            JSObject ret = new JSObject();
                            ret.put("placement", placementId);
                            ret.put("state", state.name());
                            ret.put("rewarded", isRewarded && state.equals(UnityAds.UnityAdsShowCompletionState.COMPLETED));
                            notifyListeners("unityAdsShowComplete", ret);
                            
                            if (isRewarded && state.equals(UnityAds.UnityAdsShowCompletionState.COMPLETED)) {
                                notifyListeners("unityAdsReward", ret);
                                Toast.makeText(getContext(), "Reward Earned!", Toast.LENGTH_SHORT).show();
                            }
                        }
                    });
                    call.resolve();
                }

                @Override
                public void onUnityAdsFailedToLoad(String placementId, UnityAds.UnityAdsLoadError error, String message) {
                    Toast.makeText(getContext(), "Ad Load Failed: " + message, Toast.LENGTH_SHORT).show();
                    Log.e(TAG, "Ad Load Failed: " + message);
                    call.reject(message);
                }
            });
        });
    }

    @PluginMethod
    public void showBanner(PluginCall call) {
        String placementId = call.getString("placement");
        String position = call.getString("position", "BOTTOM_CENTER");

        getActivity().runOnUiThread(() -> {
            if (bannerView != null) {
                bannerView.destroy();
                if (bannerLayout != null) {
                    bannerLayout.removeAllViews();
                    ViewGroup parent = (ViewGroup) bannerLayout.getParent();
                    if (parent != null) {
                        parent.removeView(bannerLayout);
                    }
                }
            }

            bannerView = new BannerView(getActivity(), placementId, new UnityBannerSize(320, 50));
            bannerView.setListener(new BannerView.IListener() {
                @Override
                public void onBannerLoaded(BannerView bannerAdView) {
                    JSObject ret = new JSObject();
                    ret.put("placement", placementId);
                    notifyListeners("unityAdsBannerLoaded", ret);
                    // Toast.makeText(getContext(), "Banner Loaded", Toast.LENGTH_SHORT).show();
                }

                @Override
                public void onBannerClick(BannerView bannerAdView) {
                     JSObject ret = new JSObject();
                    ret.put("placement", placementId);
                    notifyListeners("unityAdsBannerClick", ret);
                }

                @Override
                public void onBannerFailedToLoad(BannerView bannerAdView, BannerErrorInfo errorInfo) {
                     JSObject ret = new JSObject();
                    ret.put("placement", placementId);
                    ret.put("error", errorInfo.errorMessage);
                    notifyListeners("unityAdsBannerFailed", ret);
                    Toast.makeText(getContext(), "Banner Error: " + errorInfo.errorMessage, Toast.LENGTH_SHORT).show();
                }

                @Override
                public void onBannerLeftApplication(BannerView bannerAdView) {
                }

                @Override
                public void onBannerShown(BannerView bannerAdView) {
                     JSObject ret = new JSObject();
                    ret.put("placement", placementId);
                    notifyListeners("unityAdsBannerShown", ret);
                }
            });

            bannerLayout = new RelativeLayout(getActivity());
            RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(
                    RelativeLayout.LayoutParams.WRAP_CONTENT,
                    RelativeLayout.LayoutParams.WRAP_CONTENT);
            
            if (position.equalsIgnoreCase("TOP_CENTER")) {
                params.addRule(RelativeLayout.ALIGN_PARENT_TOP);
                params.addRule(RelativeLayout.CENTER_HORIZONTAL);
            } else {
                params.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
                params.addRule(RelativeLayout.CENTER_HORIZONTAL);
            }

            bannerLayout.addView(bannerView);
            getActivity().addContentView(bannerLayout, params);
            
            bannerView.load();
            call.resolve();
        });
    }
    
    @PluginMethod
    public void hideBanner(PluginCall call) {
         getActivity().runOnUiThread(() -> {
            if (bannerView != null) {
                bannerView.destroy();
                bannerView = null;
            }
            if (bannerLayout != null) {
                bannerLayout.removeAllViews();
                ViewGroup parent = (ViewGroup) bannerLayout.getParent();
                if (parent != null) {
                    parent.removeView(bannerLayout);
                }
                bannerLayout = null;
            }
            call.resolve();
         });
    }
}
