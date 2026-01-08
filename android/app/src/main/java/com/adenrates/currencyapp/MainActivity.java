package com.adenrates.currencyapp;

import android.os.Bundle;
import android.util.Log; // أضفنا هذا لمراقبة العملية
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "UnityAds_MainActivity";
    private String unityGameID = "5967793";
    private boolean testMode = true;
    private String adUnitIdInterstitial = "Interstitial_Android";
    private String adUnitIdRewarded = "Rewarded_Android";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 1. تسجيل البلاجن قبل super.onCreate
        registerPlugin(UnityAdsPlugin.class);
        
        super.onCreate(savedInstanceState);

        Log.d(TAG, "بدء عملية التهيئة لـ Unity Ads...");

        try {
            // 2. التهيئة باستخدام getInstance()
            UnityAdsHelper.getInstance().initialize(this, unityGameID, testMode);
            
            // 3. تحميل الإعلانات مسبقاً (Pre-loading)
            // نضع تأخير بسيط جداً لضمان بدء المحرك
            UnityAdsHelper.getInstance().loadAd(adUnitIdInterstitial);
            UnityAdsHelper.getInstance().loadAd(adUnitIdRewarded);
            
            Log.d(TAG, "تم استدعاء دوال التهيئة والتحميل بنجاح.");
        } catch (Exception e) {
            Log.e(TAG, "خطأ غير متوقع في MainActivity: " + e.getMessage());
        }
    }
}