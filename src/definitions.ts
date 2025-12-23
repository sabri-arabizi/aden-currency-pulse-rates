export interface UnityAdsPlugin {
  initialize(options: { gameId: string; testMode?: boolean }): Promise<{ initialized: boolean }>;
  showInterstitial(options: { placement: string }): Promise<void>;
  showRewarded(options: { placement: string }): Promise<void>;
  showBanner(options: { placement: string; position?: 'TOP_CENTER' | 'BOTTOM_CENTER' }): Promise<void>;
  hideBanner(): Promise<void>;
}
