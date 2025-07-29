import React, { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdMobBannerProps {
  adId?: string;
  position?: BannerAdPosition;
  size?: BannerAdSize;
  className?: string;
}

const AdMobBanner: React.FC<AdMobBannerProps> = ({
  adId,
  position = BannerAdPosition.BOTTOM_CENTER,
  size = BannerAdSize.BANNER,
  className = "w-full h-16 bg-gray-100/10 rounded-lg border border-gray-300/20 flex items-center justify-center"
}) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        if (!Capacitor.isNativePlatform()) {
          // في بيئة التطوير، نعرض مكون بديل
          setIsAdLoaded(true);
          return;
        }

        // تهيئة AdMob
        await AdMob.initialize({
          testingDevices: ['YOUR_DEVICE_ID'], // أضف معرف جهازك للاختبار
          initializeForTesting: true
        });

        // إعداد البانر
        const options: BannerAdOptions = {
          adId: adId || 'ca-app-pub-3940256099942544/6300978111', // معرف إختبار من Google
          adSize: size,
          position: position,
          margin: 0,
          isTesting: true // اتركه true للاختبار
        };

        // عرض البانر
        await AdMob.showBanner(options);
        setIsAdLoaded(true);

        // تحديد حالة التحميل
        setIsAdLoaded(true);
        console.log('تم تحميل إعلان البانر بنجاح');

      } catch (err) {
        console.error('خطأ في تهيئة AdMob:', err);
        setError('خطأ في تهيئة الإعلانات');
      }
    };

    initializeAdMob();

    // تنظيف عند إلغاء المكون
    return () => {
      if (Capacitor.isNativePlatform()) {
        AdMob.hideBanner().catch(console.error);
      }
    };
  }, [adId, position, size]);

  // في بيئة التطوير أو الويب، نعرض مكون بديل
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className={className}>
        <div className="text-gray-400 text-sm text-center p-2">
          <div className="bg-amber-100/20 rounded p-2 border border-amber-300/30">
            <span className="text-amber-200">📱 منطقة الإعلان - AdMob Banner</span>
            <div className="text-xs mt-1 text-amber-300/80">
              سيظهر الإعلان الحقيقي في التطبيق المحمول
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} text-red-400 text-sm`}>
        خطأ في الإعلان: {error}
      </div>
    );
  }

  if (!isAdLoaded) {
    return (
      <div className={`${className} text-gray-400 text-sm`}>
        جاري تحميل الإعلان...
      </div>
    );
  }

  // في النظام الأصلي، البانر يظهر تلقائياً في المكان المحدد
  return null;
};

export default AdMobBanner;