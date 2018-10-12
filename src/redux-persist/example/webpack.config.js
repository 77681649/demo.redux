const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const cwd = process.cwd();
const context = path.join(cwd, 'src');
const output = path.join(cwd, 'dist');

console.log(path.join(__dirname, '../src/5.1.0/src'));

module.exports = {
	context,

	entry: './index',

	output: {
		path: output,
	},

	mode: 'development',

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
					cacheDirectory: false,
					babelrc: false,
					presets: [
						require.resolve('@babel/preset-env'),
						require.resolve('@babel/preset-flow')
					],
					plugins: [
						require.resolve('@babel/plugin-proposal-async-generator-functions'),
						require.resolve('@babel/plugin-proposal-class-properties'),
						require.resolve('@babel/plugin-proposal-do-expressions'),
						require.resolve('@babel/plugin-proposal-export-default-from'),
						require.resolve('@babel/plugin-proposal-export-namespace-from'),
						require.resolve('@babel/plugin-proposal-function-bind'),
						require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
						require.resolve('@babel/plugin-proposal-object-rest-spread'),
						require.resolve('@babel/plugin-proposal-optional-catch-binding'),
						require.resolve('@babel/plugin-proposal-optional-chaining'),
					],
				},
			}
		],
	},

	resolve: {
		symlinks: true,
		alias: {
			'redux-persist': path.join(__dirname, '../src/5.1.0/src'),
		},
	},

	devtool: 'source-map',

	devServer: {
		open: false,
		hot: false,
		historyApiFallback: true,
	},

	plugins: [new CleanWebpackPlugin(output), new HtmlWebpackPlugin()],
};
