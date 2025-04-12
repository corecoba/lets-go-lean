// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Support for Hermes
config.resolver.sourceExts.push('cjs');

// Speed up development builds
config.transformer.minifierPath = 'metro-minify-terser';
config.transformer.minifierConfig = {
  compress: {
    drop_console: false, // Keep console.log statements in development
  },
};

module.exports = config; 