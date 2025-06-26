
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.eba60485e67c44be984441260bc973ea',
  appName: 'aden-currency-pulse-rates',
  webDir: 'dist',
  server: {
    url: 'https://eba60485-e67c-44be-9844-41260bc973ea.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e293b',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1e293b'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
