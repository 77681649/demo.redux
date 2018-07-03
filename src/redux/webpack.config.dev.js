const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "redux.js",
    library: "redux",
    libraryTarget: "umd"
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: "babel-loader",
        options: {
          presets: [require("babel-preset-env")],
          plugins: [require("babel-plugin-transform-object-rest-spread")]
        }
      }
    ]
  }
};
