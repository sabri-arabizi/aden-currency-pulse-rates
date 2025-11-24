import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import UnityNative from '@/lib/capacitorUnityAds';
import {
  UNITY_GAME_ID_ANDROID,
  UNITY_PLACEMENT_INTERSTITIAL_ANDROID
} from '@/lib/unityAds';

interface UnityInterstitialProps {
  delaySeconds?: number;
  trigger?: boolean;
}

const UnityInterstitial: React.FC<UnityInterstitialProps> = ({ 
  delaySeconds = 10,
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

      // Call native Capacitor plugin (stub) — will log on native side
      await UnityNative.showInterstitial(UNITY_PLACEMENT_INTERSTITIAL_ANDROID);
      console.log(`Unity Interstitial Ad: Requested native show placement=${UNITY_PLACEMENT_INTERSTITIAL_ANDROID}`);
    } catch (error) {
      console.error('Unity Interstitial Ad Error:', error);
    }
  };

  return null;
};

export default UnityInterstitial;
