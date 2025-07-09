// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add this critical resolver setting
config.resolver.sourceExts.push('cjs');

module.exports = config;