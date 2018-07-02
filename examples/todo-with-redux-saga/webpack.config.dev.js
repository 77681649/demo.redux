const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: [
    // 'react-hot-loader/patch',
    "webpack-dev-server/client?http://0.0.0.0:3000",
    "webpack/hot/only-dev-server",
    "./src/index"
  ],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "main.js"
  },
  watch: true,
  mode: "development",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
  },
  module: {
    // noParse: [
    //   /react-hot-loader/,
    //   /react/,
    //   /react-dom/,
    //   /react-redux/,
    //   /redux/,
    //   /redux-thunk/,
    //   /lodash/
    // ],
    rules: [
      // less
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
        exclude: /node_modules/
      },

      // typescript
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: "ts-loader"
      },
      // es5 , jsx
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        loader: "babel-loader",
        options: {
          // babel-loader 启用缓存策略, 提高重建的速度
          cacheDirectory: true,

          // require , 解决 npm install -g webpack webpack-cli时,
          // 无法找到preset,plugin模块的问题
          presets: [require("babel-preset-env"), require("babel-preset-react")],
          plugins: [
            require("babel-plugin-transform-object-rest-spread"),

            // 启动热替换
            require("react-hot-loader/babel")
          ]
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
  plugins: [
    // HRM - 全局开启HRM
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ]
};
