
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adenrates.currencyapp',
  appName: 'اسعار الصرف اليمن',
  webDir: 'dist',
  server: {
    url: 'https://eba60485-e67c-44be-9844-41260bc973ea.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#8B4513',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#FFD700',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      splashImageSource: '/lovable-uploads/bfcfa1bf-51a8-4cf1-ad10-24a06a782c51.png'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#8B4513',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    AdMob: {
      appId: 'ca-app-pub-3940256099942544~3347511713', // معرف اختبار - يجب استبداله بمعرفك الحقيقي
      testingDevices: ['YOUR_DEVICE_ID_HERE']
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'AdenCurrencyRates/1.0',
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 AdenCurrencyRates/1.0',
    allowNavigation: [
      'https://eba60485-e67c-44be-9844-41260bc973ea.lovableproject.com'
    ],
    backgroundColor: '#8B4513',
    buildOptions: {
      keystorePath: 'android/app/keystore.jks',
      releaseType: 'APK'
    }
  },
  ios: {
    allowsLinkPreview: false,
    backgroundColor: '#8B4513',
    scrollEnabled: true,
    swipeGesture: true,
    contentInset: 'automatic'
  }
};

export default config;
