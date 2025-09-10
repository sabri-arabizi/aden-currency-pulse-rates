import React, { useEffect } from 'react';
import { AdMob, AdOptions, AdLoadInfo, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdMobAppOpenProps {
  adId?: string;
}

const AdMobAppOpen: React.FC<AdMobAppOpenProps> = ({ adId }) => {
  useEffect(() => {
    const setupAppOpenAd = async () => {
      try {
        if (!Capacitor.isNativePlatform()) {
          console.log('📱 App Open Ad: متاح فقط في التطبيق المحمول');
          return;
        }

        await AdMob.initialize();

        const showAppOpen = async () => {
          try {
            const options: AdOptions = {
              adId: adId || 'ca-app-pub-7990450110814740/3998012142',
            };

            const loadedListener = await AdMob.addListener(
              InterstitialAdPluginEvents.Loaded,
              (info: AdLoadInfo) => {
                console.log('✅ تم تحميل إعلان فتح التطبيق (كإعلان بيني):', info);
              }
            );

            await AdMob.prepareInterstitial(options);
            await AdMob.showInterstitial();
            loadedListener.remove();

            console.log('✅ تم عرض إعلان فتح التطبيق عند العودة للتطبيق');
          } catch (e) {
            console.log('⚠️ قد لا يدعم هذا الإصدار إعلانات فتح التطبيق مباشرة؛ محاولة باستخدام إعلان بيني:', e);
          }
        };

        const handleVisibility = () => {
          if (document.visibilityState === 'visible') {
            showAppOpen();
          }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        // عند الإطلاق لأول مرة
        showAppOpen();

        return () => {
          document.removeEventListener('visibilitychange', handleVisibility);
        };
      } catch (err) {
        console.error('❌ خطأ في إعداد App Open Ad:', err);
      }
    };

    setupAppOpenAd();
  }, [adId]);

  // App Open Ads تعمل في الخلفية ولا تحتاج UI مرئي
  return null;
};

export default AdMobAppOpen;