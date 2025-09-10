import React, { useEffect, useState } from 'react';
import { AdMob, AdOptions, AdLoadInfo, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdMobInterstitialProps {
  adId?: string;
  onRefreshCount?: number;
}

const AdMobInterstitial: React.FC<AdMobInterstitialProps> = ({ 
  adId,
  onRefreshCount = 0 
}) => {
  const [shouldShowAd, setShouldShowAd] = useState(false);

  useEffect(() => {
    // عرض الإعلان البيني كل مرتين من التحديث
    if (onRefreshCount > 0 && onRefreshCount % 2 === 0) {
      setShouldShowAd(true);
    }
  }, [onRefreshCount]);

  useEffect(() => {
    const showInterstitialAd = async () => {
      try {
        if (!shouldShowAd || !Capacitor.isNativePlatform()) {
          console.log('📱 Interstitial Ad: متاح فقط في التطبيق المحمول');
          return;
        }

        await AdMob.initialize();

        const options: AdOptions = {
          adId: adId || 'ca-app-pub-7990450110814740/4668240145',
        };

        const loadedListener = await AdMob.addListener(
          InterstitialAdPluginEvents.Loaded,
          (info: AdLoadInfo) => {
            console.log('✅ تم تحميل الإعلان البيني:', info);
          }
        );

        await AdMob.prepareInterstitial(options);
        await AdMob.showInterstitial();

        console.log('✅ تم عرض الإعلان البيني بنجاح');
        setShouldShowAd(false);

        loadedListener.remove();
      } catch (err) {
        console.error('❌ خطأ في عرض الإعلان البيني:', err);
        setShouldShowAd(false);
      }
    };

    if (shouldShowAd) {
      showInterstitialAd();
    }
  }, [shouldShowAd, adId]);

  // الإعلانات البينية تعمل في الخلفية ولا تحتاج UI مرئي
  return null;
};

export default AdMobInterstitial;