import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gemini.multilingual.kamus',
  appName: 'Translator',
  webDir: 'dist',
  plugins: {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  },
  "server": {
    "androidScheme": "https"
  },
  "resources": {
    "icon": {
      "foreground": "icon-512.svg",
      "background": "icon-512.svg"
    }
  }
};

export default config;
