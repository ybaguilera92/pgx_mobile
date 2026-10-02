const { getDefaultConfig } = require('expo/metro-config');
const { withNgNative } = require('@ng-native/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNgNative(config);
