const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const NodePolyfillWebpackPlugin = require("node-polyfill-webpack-plugin");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.plugins.push(new NodePolyfillWebpackPlugin());
  return config;
};
