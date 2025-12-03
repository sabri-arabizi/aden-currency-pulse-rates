import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import UnityNative from '@/lib/capacitorUnityAds';
import { UNITY_PLACEMENT_BANNER_ANDROID } from '@/lib/unityAds';

interface UnityBannerProps {
  delaySeconds?: number;
  className?: string;
}

const UnityBanner: React.FC<UnityBannerProps> = ({ 
  delaySeconds = 10,
  className = "w-full h-16 bg-amber-900/20 rounded-lg border border-amber-300/30 backdrop-blur-sm flex items-center justify-center"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Prevent multiple banners showing at once across the app
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__unityBannerMounted) {
        // Another UnityBanner instance is already mounted; do not show this one
        return;
      }
      // Mark as mounted so subsequent instances won't render
      win.__unityBannerMounted = true;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      showBannerAd();
    }, delaySeconds * 1000);

    const unityAdsListener = UnityNative.addListener('unityAdsBannerRequested', (data) => {
      if (data.placement === UNITY_PLACEMENT_BANNER_ANDROID) {
        console.log('Unity Banner Ad requested.');
      }
    });

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        const win = window as any;
        // Clear the mounted flag on unmount so new banners can appear later if needed
        win.__unityBannerMounted = false;
      }
      unityAdsListener.remove();
    };
  }, [delaySeconds]);

  const showBannerAd = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        setAdLoaded(true);
        return;
      }
      // Call native plugin to show/init banner (native stub)
      await UnityNative.showBanner(UNITY_PLACEMENT_BANNER_ANDROID, 'bottom');
      console.log(`Unity Banner Ad: Requested native init placement=${UNITY_PLACEMENT_BANNER_ANDROID}`);
      setAdLoaded(true);
    } catch (error) {
      console.error('Unity Banner Ad Error:', error);
    }
  };

  if (!isVisible) return null;

  // في بيئة الويب، عرض placeholder
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className={className}>
        <div className="text-center p-2">
          <div className="bg-yellow-500/20 rounded p-2 border border-yellow-400/30">
            <span className="text-yellow-300 text-sm">📱 Unity Banner Ad</span>
            <div className="text-xs mt-1 text-yellow-300/80">
              سيظهر الإعلان الحقيقي في التطبيق المحمول
            </div>
          </div>
        </div>
      </div>
    );
  }

  return adLoaded ? (
    <div className={className}>
      <div className="text-yellow-300 text-sm">Unity Banner Ad Area</div>
    </div>
  ) : null;
};

export default UnityBanner;
