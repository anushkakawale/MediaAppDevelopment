const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    })
  },
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif'],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'svg']
  },
  server: {
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url.startsWith('/debugger-proxy')) {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        }
        return middleware(req, res, next);
      };
    }
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
