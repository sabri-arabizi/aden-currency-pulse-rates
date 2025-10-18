import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface UnityBannerProps {
  placementId?: string;
  delaySeconds?: number;
}

const UnityBanner: React.FC<UnityBannerProps> = ({
  placementId = 'Banner_Android',
  delaySeconds = 7
}) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAd(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  useEffect(() => {
    const loadUnityBanner = async () => {
      if (!showAd) return;

      try {
        if (!Capacitor.isNativePlatform()) {
          setIsAdLoaded(true);
          return;
        }

        // @ts-ignore - Unity Ads will be available in native platform
        const { UnityAds } = await import('capacitor-unity-ads');
        
        await UnityAds.initialize({
          gameId: '5736234',
          testMode: false
        });

        // @ts-ignore
        await UnityAds.showBanner({
          placementId: placementId
        });

        setIsAdLoaded(true);
        console.log('✅ Unity Banner Ad loaded successfully');
      } catch (error) {
        console.error('❌ Unity Banner Ad error:', error);
      }
    };

    loadUnityBanner();

    return () => {
      if (Capacitor.isNativePlatform()) {
        // Hide banner on cleanup if needed
      }
    };
  }, [showAd, placementId]);

  if (!Capacitor.isNativePlatform()) {
    return showAd ? (
      <div className="w-full h-16 bg-purple-100/10 rounded-lg border border-purple-300/20 flex items-center justify-center">
        <div className="text-purple-200 text-sm text-center p-2">
          📱 Unity Banner Ad
          <div className="text-xs mt-1 text-purple-300/80">
            سيظهر بعد {delaySeconds} ثانية في التطبيق
          </div>
        </div>
      </div>
    ) : null;
  }

  return null;
};

export default UnityBanner;
