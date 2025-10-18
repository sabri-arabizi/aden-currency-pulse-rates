import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface UnityBannerProps {
  delaySeconds?: number;
  className?: string;
}

const UnityBanner: React.FC<UnityBannerProps> = ({ 
  delaySeconds = 7,
  className = "w-full h-16 bg-amber-900/20 rounded-lg border border-amber-300/30 backdrop-blur-sm flex items-center justify-center"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      initializeUnityBanner();
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  const initializeUnityBanner = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        setAdLoaded(true);
        return;
      }

      // Unity Ads Banner implementation will be added here when Unity plugin is available
      console.log('Unity Banner Ad: Initializing...');
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
