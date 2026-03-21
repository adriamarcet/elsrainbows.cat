const path = require("path");
const HtmlBundlerPlugin = require("html-bundler-webpack-plugin");

module.exports = {
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
    assetModuleFilename: "assets/media/[name].[contenthash:8][ext][query]",
  },
  resolve: {
    extensions: [".mjs", ".js"],
    alias: {
      "@partials": path.resolve(__dirname, "src/partials"),
      "@img": path.resolve(__dirname, "src/assets/img"),
      "@audio": path.resolve(__dirname, "src/assets/audio"),
      "@video": path.resolve(__dirname, "src/assets/video"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@scripts": path.resolve(__dirname, "src/scripts"),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
      {
        test: /\.(png|jpe?g|webp|gif|svg|mp3|mp4)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: [
        { import: "./src/pages/index.html.eta", filename: "index.html" },
        { import: "./src/pages/gracies.html.eta", filename: "gracies.html" },
        { import: "./src/pages/avis-legal.html.eta", filename: "avis-legal.html" },
        { import: "./src/pages/privacitat.html.eta", filename: "privacitat.html" },
        { import: "./src/pages/cookies.html.eta", filename: "cookies.html" },
        { import: "./src/pages/quisom.html.eta", filename: "quisom.html" },
      ],
      js: {
        filename: "assets/js/[name].[contenthash:8].js",
      },
      css: {
        filename: "assets/css/[name].[contenthash:8].css",
      },
      preprocessor: "eta",
      preprocessorOptions: {
        views: path.resolve(__dirname, "src"),
      },
    }),
  ],
};
