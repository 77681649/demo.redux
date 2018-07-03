/**
 * 将src中的文件单独打包, 方便测试
 */
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");
const fs = require("fs");
const OUTPUT_PATH = ".dist";

const createEntries = () => {
  let rootpath = path.join(__dirname, "src");
  let entries = [];

  !(function search(dirpath) {
    let files = fs.readdirSync(dirpath);

    files.forEach(file => {
      let filepath = path.join(dirpath, file);
      if (fs.statSync(filepath).isDirectory()) {
        search(filepath);
      } else {
        if (/\.js$/.test(filepath)) {
          entries.push(filepath.replace(/\.js$/, ""));
        }
      }
    });
  })(rootpath);

  let entryMap = {};

  entries.forEach(e => {
    entryMap[path.relative(rootpath, e)] = e;
  });

  return entryMap;
};
let entries = createEntries();

console.log(entries);

module.exports = {
  entry: entries,
  output: {
    path: path.join(__dirname, OUTPUT_PATH),
    // library: "[name]",
    libraryTarget: "commonjs"
  },
  devtool: "cheap-source-map",
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
  },
  plugins: [new CleanWebpackPlugin([OUTPUT_PATH])]
};
