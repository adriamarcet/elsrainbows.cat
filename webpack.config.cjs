const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    main: path.resolve(__dirname, "bundle.mjs"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/js/[name].[contenthash:8].js",
    assetModuleFilename: "assets/media/[name].[contenthash:8][ext][query]",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          sources: {
            list: [
              "...",
              {
                tag: "audio",
                attribute: "src",
                type: "src",
              },
              {
                tag: "video",
                attribute: "src",
                type: "src",
              },
            ],
          },
          minimize: false,
        },
      },
      {
        test: /\.(png|jpe?g|webp|gif|svg|mp3|mp4)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "assets/css/[name].[contenthash:8].css",
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
      filename: "index.html",
      chunks: ["main"],
      inject: "body",
      scriptLoading: "module",
      minify: false,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "gracies.html"),
      filename: "gracies.html",
      chunks: ["main"],
      inject: "body",
      scriptLoading: "module",
      minify: false,
    }),
  ],
  resolve: {
    extensions: [".mjs", ".js"],
  },
};
