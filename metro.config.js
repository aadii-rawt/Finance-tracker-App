const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ✅ Add support for `.cjs` Firebase modules
config.resolver.sourceExts.push('cjs');

// ✅ Disable unstable package export resolution to fix Firebase auth
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
