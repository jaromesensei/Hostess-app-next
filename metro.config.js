const { getDefaultConfig } = require('expo/metro-config');

// NativeWind's metro plugin (withNativeWind) pulls in lightningcss which
// references browser-only globals (DOMRect, DOMPoint) and crashes on Hermes.
// We use StyleSheet everywhere, so the NativeWind transform is not needed.
const config = getDefaultConfig(__dirname);

module.exports = config;
