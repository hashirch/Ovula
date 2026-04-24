import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ovula.app',
  appName: 'Ovula',
  webDir: 'build',
  server: {
    // Use http scheme to avoid mixed content issues with the HTTP backend
    androidScheme: 'http',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFF0F3',
      showSpinner: false,
    },
  },
};

export default config;
