import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';

interface UnityRewardedProps {
  delaySeconds?: number;
  buttonText?: string;
  onRewardEarned?: () => void;
}

const UnityRewarded: React.FC<UnityRewardedProps> = ({ 
  delaySeconds = 7,
  buttonText = 'شاهد إعلان للحصول على مكافأة',
  onRewardEarned 
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      loadRewardedAd();
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  const loadRewardedAd = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Unity Rewarded Ad: متاح فقط في التطبيق المحمول');
        return;
      }

      // Unity Ads Rewarded implementation will be added here when Unity plugin is available
      console.log('Unity Rewarded Ad: Loading...');
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

      // Unity Ads Rewarded show implementation
      console.log('Unity Rewarded Ad: Showing...');
      
      // Simulate reward
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
