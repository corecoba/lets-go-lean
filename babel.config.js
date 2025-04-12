module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Enable React Native Reanimated plugin
      'react-native-reanimated/plugin',
      // Expo Router
      require.resolve('expo-router/babel'),
    ],
    // Ensure proper source maps for debugging with Hermes
    env: {
      development: {
        plugins: [
          '@babel/plugin-transform-react-jsx-source',
        ],
      },
    },
  };
}; 