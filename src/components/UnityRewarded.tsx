import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import UnityNative from '@/lib/capacitorUnityAds';
import {
  UNITY_GAME_ID_ANDROID,
  UNITY_PLACEMENT_REWARDED_ANDROID
} from '@/lib/unityAds';
import { Button } from '@/components/ui/button';

interface UnityRewardedProps {
  delaySeconds?: number;
  buttonText?: string;
  onRewardEarned?: () => void;
  autoShow?: boolean; // if true, show rewarded automatically when ready
}

const UnityRewarded: React.FC<UnityRewardedProps> = ({ 
  delaySeconds = 15,
  buttonText = 'شاهد إعلان للحصول على مكافأة',
  onRewardEarned 
  ,
  autoShow = false
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownAuto, setHasShownAuto] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      loadRewardedAd();
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  // Auto-show when ready (for example: in prices section after load)
  useEffect(() => {
    if (isReady && autoShow && !hasShownAuto) {
      showRewardedAd();
      setHasShownAuto(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, autoShow, hasShownAuto]);

  const loadRewardedAd = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Unity Rewarded Ad: متاح فقط في التطبيق المحمول');
        return;
      }
      // Call native plugin to prepare/load rewarded ad (native stub)
      await UnityNative.initialize(UNITY_GAME_ID_ANDROID);
      console.log('Unity Rewarded Ad: Loading (native stub)...');
    } catch (error) {
      console.error('Unity Rewarded Ad Error:', error);
    }
  };

  const showRewardedAd = async () => {
    if (!isReady) return;
    
    setIsLoading(true);
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Unity Rewarded Ad: عرض في الويب للاختبار');
        setTimeout(() => {
          onRewardEarned?.();
          setIsLoading(false);
        }, 1000);
        return;
      }
        // Call native plugin to show rewarded (native stub)
        await UnityNative.showRewarded(UNITY_PLACEMENT_REWARDED_ANDROID);
        console.log(`Unity Rewarded Ad: Requested native show placement=${UNITY_PLACEMENT_REWARDED_ANDROID}`);
        // We don't have native callbacks yet; simulate reward after short delay
        setTimeout(() => {
          onRewardEarned?.();
          setIsLoading(false);
          loadRewardedAd(); // Load next ad
        }, 2000);
    } catch (error) {
      console.error('Unity Rewarded Ad Error:', error);
      setIsLoading(false);
    }
  };

  if (!isReady) return null;

  return (
    <div className="mt-6 text-center">
      <Button
        onClick={showRewardedAd}
        disabled={isLoading}
        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg"
      >
        {isLoading ? '⏳ جاري التحميل...' : `🎁 ${buttonText}`}
      </Button>
      {!Capacitor.isNativePlatform() && (
        <div className="text-xs text-yellow-300/80 mt-2">
          سيظهر الإعلان الحقيقي في التطبيق المحمول
        </div>
      )}
    </div>
  );
};

export default UnityRewarded;
