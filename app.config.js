module.exports = {
  expo: {
    name: 'Rizzze',
    slug: 'rizzze',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'rizzze',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ['audio'],
      },
      bundleIdentifier: 'com.lucastelpis.rizzze',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#2D2B3D',
        foregroundImage: './assets/images/icon.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: [],
      package: 'com.lucastelpis.rizzze',
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/mascot_welcome.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#2D2B3D',
          dark: {
            backgroundColor: '#2D2B3D',
          },
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#8B6DAE',
        },
      ],
      [
        'expo-audio',
        {
          enableBackgroundPlayback: true,
        },
      ],
      'expo-asset',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: false,
    },
    updates: {
      enabled: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: '9f83e2ad-cbd8-47bf-a85c-7663edcd666f',
      },
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
    owner: 'lucastelpis',
  },
};
