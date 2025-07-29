import React, { useEffect } from 'react';
import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdMobAppOpenProps {
  adId?: string;
}

const AdMobAppOpen: React.FC<AdMobAppOpenProps> = ({ adId }) => {
  useEffect(() => {
    const initializeAppOpenAd = async () => {
      try {
        if (!Capacitor.isNativePlatform()) {
          console.log('📱 App Open Ad: متاح فقط في التطبيق المحمول');
          return;
        }

        // تهيئة AdMob
        await AdMob.initialize({
          testingDevices: ['YOUR_DEVICE_ID'],
          initializeForTesting: true
        });

        console.log('✅ تم تهيئة AdMob لإعلانات App Open');

        // إضافة مستمع للأحداث
        const handleAppStateChange = () => {
          if (document.visibilityState === 'visible') {
            console.log('📱 التطبيق أصبح مرئياً - يمكن عرض App Open Ad هنا');
            // هنا يمكن إضافة منطق عرض الإعلان عند توفر API مناسب
          }
        };

        document.addEventListener('visibilitychange', handleAppStateChange);

        return () => {
          document.removeEventListener('visibilitychange', handleAppStateChange);
        };

      } catch (err) {
        console.error('❌ خطأ في تهيئة App Open Ad:', err);
      }
    };

    initializeAppOpenAd();
  }, [adId]);

  // App Open Ads تعمل في الخلفية ولا تحتاج UI مرئي
  return null;
};

export default AdMobAppOpen;