import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface UnityInterstitialProps {
  delaySeconds?: number;
  trigger?: boolean;
}

const UnityInterstitial: React.FC<UnityInterstitialProps> = ({ 
  delaySeconds = 7,
  trigger = false 
}) => {
  const [canShow, setCanShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanShow(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  useEffect(() => {
    if (canShow && trigger && !hasShown) {
      showInterstitialAd();
      setHasShown(true);
    }
  }, [canShow, trigger, hasShown]);

  const showInterstitialAd = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Unity Interstitial Ad: متاح فقط في التطبيق المحمول');
        return;
      }

      // Unity Ads Interstitial implementation will be added here when Unity plugin is available
      console.log('Unity Interstitial Ad: Showing...');
    } catch (error) {
      console.error('Unity Interstitial Ad Error:', error);
    }
  };

  return null;
};

export default UnityInterstitial;
