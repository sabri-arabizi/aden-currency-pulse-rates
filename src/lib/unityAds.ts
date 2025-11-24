// Unity Ads configuration constants
export const UNITY_GAME_ID_ANDROID = '5967793';
export const UNITY_PLACEMENT_INTERSTITIAL_ANDROID = 'Interstitial_Android';
export const UNITY_PLACEMENT_REWARDED_ANDROID = 'Rewarded_Android';
export const UNITY_PLACEMENT_BANNER_ANDROID = 'Banner_Android';

// Export a shape to make it easy to extend for other platforms in the future
export default {
  gameIdAndroid: UNITY_GAME_ID_ANDROID,
  interstitialAndroid: UNITY_PLACEMENT_INTERSTITIAL_ANDROID,
  rewardedAndroid: UNITY_PLACEMENT_REWARDED_ANDROID,
  bannerAndroid: UNITY_PLACEMENT_BANNER_ANDROID,
};
