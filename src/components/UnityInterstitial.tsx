import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface UnityInterstitialProps {
  placementId?: string;
  delaySeconds?: number;
  trigger?: boolean;
}

const UnityInterstitial: React.FC<UnityInterstitialProps> = ({
  placementId = 'Interstitial_Android',
  delaySeconds = 7,
  trigger = false
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  useEffect(() => {
    const initializeUnity = async () => {
      if (!shouldShow) return;

      try {
        if (!Capacitor.isNativePlatform()) {
          console.log('📱 Unity Interstitial متاح فقط في التطبيق المحمول');
          return;
        }

        // @ts-ignore
        const { UnityAds } = await import('capacitor-unity-ads');
        
        await UnityAds.initialize({
          gameId: '5736234',
          testMode: false
        });

        setIsInitialized(true);
        console.log('✅ Unity Ads initialized for Interstitial');
      } catch (error) {
        console.error('❌ Unity Ads initialization error:', error);
      }
    };

    initializeUnity();
  }, [shouldShow]);

  useEffect(() => {
    const showInterstitial = async () => {
      if (!isInitialized || !trigger) return;

      try {
        if (!Capacitor.isNativePlatform()) return;

        // @ts-ignore - Unity Ads will be available in native platform
        const { UnityAds } = await import('capacitor-unity-ads');
        
        // @ts-ignore
        await UnityAds.showInterstitial({
          placementId: placementId
        });

        console.log('✅ Unity Interstitial Ad shown');
      } catch (error) {
        console.error('❌ Unity Interstitial error:', error);
      }
    };

    showInterstitial();
  }, [trigger, isInitialized, placementId]);

  return null;
};

export default UnityInterstitial;
