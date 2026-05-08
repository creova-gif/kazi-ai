const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Only block the project's own src/ directory (old web app), NOT node_modules src/ paths
// Also block expo-router temp directories that appear during startup
config.resolver.blockList = [
  new RegExp(`^${path.join(__dirname, 'src').replace(/\\/g, '/')}(/.*)?$`),
  /.*expo-router_tmp.*/,
];

// Stub out @expo/log-box's web polyfill — it uses JSX that conflicts with the
// automatic JSX runtime in development mode (Duplicate __self prop error).
// The error overlay is non-essential for running the app.
const _origResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes('logbox-web-polyfill')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'stubs/logbox-web-polyfill.js'),
    };
  }
  if (_origResolve) {
    return _origResolve(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
