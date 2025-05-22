const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.sourceExts.push('js');
defaultConfig.resolver.sourceExts.push('jsx');
defaultConfig.resolver.sourceExts.push('ts');
defaultConfig.resolver.sourceExts.push('tsx');

// This is the new line you should add in, after the previous lines
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig; 