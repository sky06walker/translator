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
    "androidScheme": "https",
    "hostname": "translator.whstudio.dpdns.org"
  },
};

export default config;
