import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import UnityNative from '@/lib/capacitorUnityAds';
import { UNITY_PLACEMENT_BANNER_ANDROID } from '@/lib/unityAds';

interface UnityBannerProps {
  isInitialized: boolean;
  className?: string;
}

const UnityBanner: React.FC<UnityBannerProps> = ({
  isInitialized,
  className = "w-full h-16 bg-amber-900/20 rounded-lg border border-amber-300/30 backdrop-blur-sm flex items-center justify-center"
}) => {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    let refreshInterval: NodeJS.Timeout;

    const loadBanner = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          console.log('📱 Requesting Unity Banner (TOP_CENTER)...');
          await UnityNative.showBanner({ placement: UNITY_PLACEMENT_BANNER_ANDROID, position: 'TOP_CENTER' });
        } catch (error) {
          console.error('❌ Unity Banner Error:', error);
        }
      } else {
        setAdLoaded(true); // Web fallback
      }
    };

    // Initial load
    loadBanner();

    // Refresh every 60 seconds
    refreshInterval = setInterval(() => {
      console.log('♻️ Refreshing Unity Banner...');
      loadBanner();
    }, 60000);

    const setupListeners = async () => {
      try {
        const handle = await UnityNative.addListener('unityAdsBannerLoaded', (data) => {
          if (data.placement === UNITY_PLACEMENT_BANNER_ANDROID) {
            console.log('✅ Unity Banner Ad loaded.');
            setAdLoaded(true);
          }
        });
        return handle;
      } catch (e) {
        console.error('Error adding listener', e);
      }
    };

    let listenerHandle: any;
    setupListeners().then(h => { listenerHandle = h; });

    return () => {
      clearInterval(refreshInterval);
      if (listenerHandle) {
        listenerHandle.remove();
      }
      if (Capacitor.isNativePlatform()) {
        // Optional: Hide banner on unmount if you want to clear it
        // UnityNative.hideBanner(); 
      }
    };
  }, [isInitialized]);

  if (!isInitialized) return null;

  // Web Placeholder
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className={className}>
        <div className="text-center p-2">
          <div className="bg-yellow-500/20 rounded p-2 border border-yellow-400/30">
            <span className="text-yellow-300 text-sm">📱 Unity Banner Ad (Top)</span>
            <div className="text-xs mt-1 text-yellow-300/80">
              Refreshes every 60s
            </div>
          </div>
        </div>
      </div>
    );
  }

  return adLoaded ? (
    <div className={className}>
      {/* The native banner sits on top of the webview, this div just reserves space if needed, 
          but for TOP_CENTER overlay, we might not need space here. 
          However, keeping it for layout consistency if the user wants it inline. 
          If it's an overlay, this div might be empty or hidden. 
          Let's keep it as a spacer. */}
      <div className="text-yellow-300 text-sm opacity-0">Unity Banner Ad Area</div>
    </div>
  ) : null;
};

export default UnityBanner;
