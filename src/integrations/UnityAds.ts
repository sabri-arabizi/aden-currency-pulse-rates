import { registerPlugin } from '@capacitor/core';

export interface UnityAdsPlugin {
    showBanner(): Promise<void>;
    showInterstitial(): Promise<void>;
    showRewarded(): Promise<void>;
}

const UnityAds = registerPlugin<UnityAdsPlugin>('UnityAds');

export default UnityAds;
