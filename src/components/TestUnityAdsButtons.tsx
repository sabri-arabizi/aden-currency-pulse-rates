import React, { useState } from 'react';
import UnityNative, { initialize, showInterstitial, showBanner } from '../lib/capacitorUnityAds';

const GAME_ID_ANDROID = '5967793';

export default function TestUnityAdsButtons(): JSX.Element {
  const [status, setStatus] = useState<string>('');

  const handleInit = async () => {
    try {
      setStatus('Initializing...');
      await initialize(GAME_ID_ANDROID);
      setStatus('Initialized');
    } catch (e) {
      console.error('init error', e);
      setStatus('Init error');
    }
  };

  const handleInterstitial = async () => {
    try {
      setStatus('Requesting interstitial...');
      await initialize(GAME_ID_ANDROID);
      await showInterstitial('Interstitial_Android');
      setStatus('Interstitial requested');
    } catch (e) {
      console.error('show interstitial error', e);
      setStatus('Interstitial error');
    }
  };

  const handleBanner = async () => {
    try {
      setStatus('Requesting banner...');
      await initialize(GAME_ID_ANDROID);
      await showBanner('Banner_Android', 'bottom');
      setStatus('Banner requested');
    } catch (e) {
      console.error('show banner error', e);
      setStatus('Banner error');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleInterstitial}
        >
          اختبار Interstitial
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={handleBanner}
        >
          اختبار Banner
        </button>
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded"
          onClick={handleInit}
        >
          تهيئة Unity
        </button>
      </div>
      <div className="text-sm text-gray-600">{status}</div>
    </div>
  );
}
