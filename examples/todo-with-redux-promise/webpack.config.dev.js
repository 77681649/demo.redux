const path = require("path");

module.exports = {
  entry: "./src/index",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "main.js",
    publicPath: "/"
  },
  mode: "development",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
  },
  module: {
    // noParse:[
    //   /react/,
    //   /react-dom/,
    //   /react-redux/,
    //   /redux/,
    //   /redux-thunk/,
    //   /lodash/
    // ],
    rules: [
      // typescript
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      // es5 , jsx
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        options: {
          // require , 解决 npm install -g webpack webpack-cli时,
          // 无法找到preset,plugin模块的问题
          presets: [require("babel-preset-env"), require("babel-preset-react")],
          plugins: [require("babel-plugin-transform-object-rest-spread")]
        }
      }
      // source-map-loader
      // {
      //   test: /\.js?$/,
      //   use: "source-map-loader",
      //   enforce: "pre"
      // }
    ]
  },
  devtool: "inline-source-map",
  watch: true,
  plugins: []
};
