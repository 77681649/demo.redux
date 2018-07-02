const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const chalk = require("chalk");

const config = require("./webpack.config.dev.js");
const compiler = webpack(config);

const serverConfig = {
  headers: {
    "Access-Control-Allow-Origin": "*"
  },
  hot: true
};

const devServer = new WebpackDevServer(compiler, serverConfig);
devServer.listen(3000, "localhost", err => {
  if (err) {
    return console.log(err);
  }

  console.log(chalk.cyan("Starting the development server...\n"));
});
