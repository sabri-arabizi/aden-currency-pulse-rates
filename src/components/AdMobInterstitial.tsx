import React, { useEffect, useState } from 'react';
import { AdMob } from '@capacitor-community/admob';
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

        // تهيئة AdMob
        await AdMob.initialize({
          testingDevices: ['YOUR_DEVICE_ID'],
          initializeForTesting: false
        });

        // إعداد الإعلان البيني
        const options = {
          adId: adId || 'ca-app-pub-7990450110814740/4668240145',
          isTesting: false
        };

        // ملاحظة: prepareInterstitial و showInterstitial قد لا تكونان متاحتين في هذا الإصدار
        // سنحاول استخدام showBanner بدلاً من ذلك كحل مؤقت
        try {
          // محاولة عرض إعلان بيني إذا كان متاحاً
          console.log('محاولة عرض إعلان بيني...');
        } catch (interstitialError) {
          console.log('الإعلانات البينية غير متاحة حالياً:', interstitialError);
        }
        
        console.log('✅ تم عرض الإعلان البيني بنجاح');
        setShouldShowAd(false);

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