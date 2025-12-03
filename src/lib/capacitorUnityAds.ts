// Simple Capacitor wrapper for Unity Ads plugin (native stubs)
type UnityAdsPlugin = {
  initialize?: (options: { gameId: string }) => Promise<any>;
  showInterstitial?: (options: { placement: string }) => Promise<any>;
  showRewarded?: (options: { placement: string }) => Promise<any>;
  showBanner?: (options: { placement: string; position?: string }) => Promise<any>;
  addListener?: (eventName: string, callback: (data: any) => void) => { remove: () => void };
};

function getPlugin(): UnityAdsPlugin | null {
  // Capacitor exposes plugins on `window.Capacitor.Plugins` in many setups
  // Provide safe access and fallback to null if not available
  try {
    // @ts-ignore
    const cap = (window as any).Capacitor;
    if (cap && cap.Plugins && cap.Plugins.UnityAds) {
      return cap.Plugins.UnityAds as UnityAdsPlugin;
    }
    // Capacitor may also expose global Plugins
    // @ts-ignore
    if ((window as any).Plugins && (window as any).Plugins.UnityAds) {
      // @ts-ignore
      return (window as any).Plugins.UnityAds as UnityAdsPlugin;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export async function initialize(gameId: string) {
  const plugin = getPlugin();
  if (plugin && plugin.initialize) {
    return plugin.initialize({ gameId });
  }
  console.info("UnityAds (native) unavailable — initialize fallback. gameId=", gameId);
  return Promise.resolve();
}

export async function showInterstitial(placement: string) {
  const plugin = getPlugin();
  if (plugin && plugin.showInterstitial) {
    return plugin.showInterstitial({ placement });
  }
  console.info("Unity Interstitial (fallback) — placement=", placement);
  return Promise.resolve();
}

export async function showRewarded(placement: string) {
  const plugin = getPlugin();
  if (plugin && plugin.showRewarded) {
    return plugin.showRewarded({ placement });
  }
  console.info("Unity Rewarded (fallback) — placement=", placement);
  return Promise.resolve();
}

export async function showBanner(placement: string, position: string = "bottom") {
  const plugin = getPlugin();
  if (plugin && plugin.showBanner) {
    return plugin.showBanner({ placement, position });
  }
  console.info("Unity Banner (fallback) — placement=", placement, "position=", position);
  return Promise.resolve();
}

export function addListener(eventName: string, callback: (data: any) => void) {
  try {
    const plugin = getPlugin();
    if (plugin && plugin.addListener) {
      return plugin.addListener(eventName, callback);
    }
  } catch (e) {
    // ignore
  }
  return { remove: () => { } };
}

export default {
  initialize,
  showInterstitial,
  showRewarded,
  showBanner,
  addListener,
};
