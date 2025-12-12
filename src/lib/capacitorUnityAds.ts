import { registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface UnityAdsPluginContract {
  initialize(options: { gameId: string; testMode?: boolean }): Promise<{ initialized: boolean; message?: string }>;
  showInterstitial(options: { placement: string }): Promise<void>;
  showRewarded(options: { placement: string }): Promise<void>;
  showBanner(options: { placement: string; position?: string }): Promise<void>;
  hideBanner(): Promise<void>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<PluginListenerHandle>;
}

const UnityAds = registerPlugin<UnityAdsPluginContract>('UnityAds');

export default UnityAds;
