import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from './ui/button';

interface UnityRewardedProps {
  placementId?: string;
  delaySeconds?: number;
  onRewardEarned?: () => void;
  buttonText?: string;
}

const UnityRewarded: React.FC<UnityRewardedProps> = ({
  placementId = 'Rewarded_Android',
  delaySeconds = 7,
  onRewardEarned,
  buttonText = 'شاهد إعلان للحصول على مكافأة'
}) => {
  const [isReady, setIsReady] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  useEffect(() => {
    const initializeUnity = async () => {
      if (!showButton) return;

      try {
        if (!Capacitor.isNativePlatform()) {
          setIsReady(true);
          return;
        }

        // @ts-ignore
        const { UnityAds } = await import('capacitor-unity-ads');
        
        await UnityAds.initialize({
          gameId: '5736234',
          testMode: false
        });

        setIsReady(true);
        console.log('✅ Unity Rewarded Ad ready');
      } catch (error) {
        console.error('❌ Unity Rewarded initialization error:', error);
      }
    };

    initializeUnity();
  }, [showButton]);

  const handleShowRewarded = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('📱 عرض إعلان تجريبي');
        onRewardEarned?.();
        return;
      }

      // @ts-ignore - Unity Ads will be available in native platform
      const { UnityAds } = await import('capacitor-unity-ads');
      
      // @ts-ignore
      await UnityAds.showRewarded({
        placementId: placementId
      });

      console.log('✅ Unity Rewarded Ad shown');
      onRewardEarned?.();
    } catch (error) {
      console.error('❌ Unity Rewarded error:', error);
    }
  };

  if (!showButton || !isReady) return null;

  return (
    <div className="w-full mt-4">
      <Button
        onClick={handleShowRewarded}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        🎁 {buttonText}
      </Button>
    </div>
  );
};

export default UnityRewarded;
