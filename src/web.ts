import { WebPlugin } from '@capacitor/core';
import type { UnityAdsPlugin } from './definitions';

export class UnityAdsWeb extends WebPlugin implements UnityAdsPlugin {
  async initialize(options: { gameId: string; testMode?: boolean }): Promise<{ initialized: boolean }> {
    console.log('UnityAds initialize', options);
    return { initialized: false };
  }

  async showInterstitial(options: { placement: string }): Promise<void> {
    console.log('UnityAds showInterstitial', options);
  }

  async showRewarded(options: { placement: string }): Promise<void> {
    console.log('UnityAds showRewarded', options);
  }

  async showBanner(options: { placement: string; position?: 'TOP_CENTER' | 'BOTTOM_CENTER' }): Promise<void> {
    console.log('UnityAds showBanner', options);
  }

  async hideBanner(): Promise<void> {
    console.log('UnityAds hideBanner');
  }
}
