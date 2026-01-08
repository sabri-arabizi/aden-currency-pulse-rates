package com.adenrates.currencyapp;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;
import com.unity3d.services.banners.BannerErrorInfo;
import com.unity3d.services.banners.BannerView;
import com.unity3d.services.banners.UnityBannerSize;

import java.lang.ref.WeakReference;
import java.util.HashSet;
import java.util.Set;

/**
 * Singleton helper class to manage Unity Ads integration.
 * Handles Initialization, Loading, and Showing of Interstitial, Rewarded, and Banner Ads.
 */
public class UnityAdsHelper implements IUnityAdsInitializationListener {

    private static UnityAdsHelper instance;
    private static final String TAG = "UnityAdsHelper";
    private boolean isInitializing = false; // Track if init is in progress

    // Interface for reward callback
    public interface RewardListener {
        void onUserEarnedReward();
    }

    private RewardListener currentRewardListener;
    private BannerView bannerView;
    private WeakReference<Activity> currentActivityRef;

    // Pending actions
    private Set<String> pendingLoadPlacementIds = new HashSet<>();
    private String pendingBannerAdUnitId = null;

    // Private constructor for Singleton
    private UnityAdsHelper() {}

    public static synchronized UnityAdsHelper getInstance() {
        if (instance == null) {
            instance = new UnityAdsHelper();
        }
        return instance;
    }

    /**
     * Initialize Unity Ads SDK.
     * @param context Application context.
     * @param gameId Your Unity Game ID.
     * @param testMode True for test mode, false for production.
     */
    public void initialize(Context context, String gameId, boolean testMode) {
        if (context instanceof Activity) {
            currentActivityRef = new WeakReference<>((Activity) context);
        }

        if (UnityAds.isInitialized()) {
            Log.d(TAG, "Unity Ads is already initialized.");
            return;
        }

        if (isInitializing) {
            Log.d(TAG, "Unity Ads is currently initializing...");
            return;
        }

        Log.d(TAG, "Initializing Unity Ads... GameID: " + gameId + ", TestMode: " + testMode);
        
        // Enable Debug Mode for more verbose logs if in Test Mode
        UnityAds.setDebugMode(testMode);
        
        isInitializing = true;
        UnityAds.initialize(context, gameId, testMode, this);
    }

    @Override
    public void onInitializationComplete() {
        isInitializing = false;
        Log.d(TAG, "Unity Ads Initialization Complete.");

        // Process pending loads
        for (String placementId : pendingLoadPlacementIds) {
            Log.d(TAG, "Processing pending load for: " + placementId);
            loadAd(placementId);
        }
        pendingLoadPlacementIds.clear();

        // Process pending banner
        if (pendingBannerAdUnitId != null && currentActivityRef != null) {
            Activity activity = currentActivityRef.get();
            if (activity != null) {
                Log.d(TAG, "Processing pending banner for: " + pendingBannerAdUnitId);
                showBanner(activity, pendingBannerAdUnitId);
            }
        }
        pendingBannerAdUnitId = null; 
    }

    @Override
    public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
        isInitializing = false;
        Log.e(TAG, "Unity Ads Initialization Failed: [" + error + "] " + message);
    }

    /**
     * Load an ad (Interstitial or Rewarded).
     * @param adUnitId The Ad Unit ID to load.
     */
    public void loadAd(String adUnitId) {
        if (UnityAds.isInitialized()) {
            Log.d(TAG, "Loading Ad: " + adUnitId);
            UnityAds.load(adUnitId, new IUnityAdsLoadListener() {
                @Override
                public void onUnityAdsAdLoaded(String placementId) {
                    Log.d(TAG, "Ad Loaded Successfully: " + placementId);
                }

                @Override
                public void onUnityAdsFailedToLoad(String placementId, UnityAds.UnityAdsLoadError error, String message) {
                    Log.e(TAG, "Ad Failed to Load: " + placementId + " Error: " + message);
                }
            });
        } else {
            Log.d(TAG, "Unity Ads not initialized yet. Queuing load request for: " + adUnitId);
            pendingLoadPlacementIds.add(adUnitId);
        }
    }

    /**
     * Show Interstitial Ad.
     * @param activity current Activity.
     * @param adUnitId The Ad Unit ID (Interstitial).
     */
    public void showInterstitial(Activity activity, String adUnitId) {
        currentActivityRef = new WeakReference<>(activity);
        
        if (UnityAds.isInitialized()) {
            UnityAds.show(activity, adUnitId, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                @Override
                public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {
                    Log.e(TAG, "Interstitial Show Failed: " + message);
                    showToast(activity, "Ad Show Failed: " + message);
                }

                @Override
                public void onUnityAdsShowStart(String placementId) {
                    Log.d(TAG, "Interstitial Show Start: " + placementId);
                }

                @Override
                public void onUnityAdsShowClick(String placementId) {
                    Log.d(TAG, "Interstitial Clicked");
                }

                @Override
                public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                    Log.d(TAG, "Interstitial Closed");
                }
            });
        } else {
            Log.e(TAG, "Unity Ads not initialized. Cannot show Interstitial.");
            // Optionally queue this show request too? 
            // For now, let's just create a Toast
            showToast(activity, "Ad not ready (Initializing...)");
            loadAd(adUnitId); // Ensure it's loaded for next time
        }
    }

    /**
     * Show Rewarded Video Ad with Callback.
     * @param activity current Activity.
     * @param adUnitId The Ad Unit ID (Rewarded).
     * @param listener Callback for reward.
     */
    public void showRewarded(Activity activity, String adUnitId, RewardListener listener) {
        currentActivityRef = new WeakReference<>(activity);
        this.currentRewardListener = listener;

        if (UnityAds.isInitialized()) {
            UnityAds.show(activity, adUnitId, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                @Override
                public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {
                    Log.e(TAG, "Rewarded Show Failed: " + message);
                    showToast(activity, "Rewarded Ad Failed: " + message);
                    currentRewardListener = null;
                }

                @Override
                public void onUnityAdsShowStart(String placementId) {
                    Log.d(TAG, "Rewarded Show Start");
                }

                @Override
                public void onUnityAdsShowClick(String placementId) {
                    Log.d(TAG, "Rewarded Clicked");
                }

                @Override
                public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                    Log.d(TAG, "Rewarded Complete. State: " + state);
                    if (state.equals(UnityAds.UnityAdsShowCompletionState.COMPLETED) && currentRewardListener != null) {
                        Log.d(TAG, "Granting Reward!");
                        currentRewardListener.onUserEarnedReward();
                    }
                    currentRewardListener = null;
                }
            });
        } else {
            Log.e(TAG, "Unity Ads not initialized. Cannot show Rewarded Ad.");
            showToast(activity, "Ad not ready (Initializing...)");
            loadAd(adUnitId);
        }
    }

    /**
     * Show Banner Ad.
     * @param activity Current activity.
     * @param bannerAdUnitId Banner Ad Unit ID.
     */
    public void showBanner(Activity activity, String bannerAdUnitId) {
        currentActivityRef = new WeakReference<>(activity);

        if (!UnityAds.isInitialized()) {
             Log.d(TAG, "Unity Ads not initialized. Queuing Banner request.");
             pendingBannerAdUnitId = bannerAdUnitId;
             return;
        }

        // Destroy previous banner if exists
        if (bannerView != null) {
            bannerView.destroy();
            bannerView = null;
        }

        // Create new BannerView
        bannerView = new BannerView(activity, bannerAdUnitId, new UnityBannerSize(320, 50));
        bannerView.setListener(new BannerView.Listener() {
            @Override
            public void onBannerLoaded(BannerView bannerAdView) {
                Log.d(TAG, "Banner Loaded");
                bannerView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onBannerFailedToLoad(BannerView bannerAdView, BannerErrorInfo errorInfo) {
                Log.e(TAG, "Banner Failed: " + errorInfo.errorMessage);
                // Removed toast to avoid annoyance if banner fails silently
            }

            @Override
            public void onBannerClick(BannerView bannerAdView) {
                Log.d(TAG, "Banner Clicked");
            }

            @Override
            public void onBannerLeftApplication(BannerView bannerAdView) {
                Log.d(TAG, "Banner Left App");
            }
        });

        // Add to the activity layout (At the bottom)
        ViewGroup rootView = activity.findViewById(android.R.id.content);
        if (rootView != null) {
            // Check if we already have a banner view added to avoid duplicates if something went wrong
            // But we destroyed it above.
            
            FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT
            );
            params.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
            // params.bottomMargin = 50; // Optional margin
            rootView.addView(bannerView, params);
            bannerView.load();
        } else {
            Log.e(TAG, "Root View not found, cannot show banner.");
        }
    }

    private void showToast(final Context context, final String message) {
        if (context instanceof Activity) {
            ((Activity) context).runOnUiThread(() -> 
                android.widget.Toast.makeText(context, message, android.widget.Toast.LENGTH_SHORT).show()
            );
        }
    }
}
