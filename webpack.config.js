var webpack = require('webpack');

var autoprefixer = require('autoprefixer');
var browserslist = require('browserslist');
var postcss = require('postcss');
var cssnext = require('cssnext');
var cssnano = require('cssnano');
var nestedcss = require('postcss-nested');
var cssimport = require('postcss-import');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var path = require('path');
var fs = require('fs');

var env = process.env.NODE_ENV || "development";

var nodeModules = {};

fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

var Module = {};

Module.frontend = {
	devtool: 'sourcemap',
	output: {
		filename: 'main.js'
	},
	resolve: {
		alias: {
			'bootstrap.css': "node_modules/bootstrap/dist/css/bootstrap.css"
		}
	},
	module: {
		loaders: [
			 { test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'babel' },
       { test: /\.html$/, loader: 'raw' },
			 // inline base64 URLs for <=12k images, direct URLs for the rest otherwise serve as file
			 { test: /\.(jpg|jpeg|png|gif|svg)$/, loaders: ['url-loader?limit=12288'] },
			 { test: /\.(eot|woff2|woff|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?(\?iefix)?(#webfont)?$/, loaders: ['file'] },
			 { test: /\.css$/, loader: ExtractTextPlugin.extract('css-loader!postcss-loader') }
		]
	},
	postcss: [cssimport(), autoprefixer({browsers: browserslist.defaults}), cssnext(), nestedcss()],
	plugins: [
  	new ExtractTextPlugin("[name].css"),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			"window.jQuery": "jquery",
			"root.jQuery": "jquery"
		})
  ],
	node: {
		console: true
	}
};

if (env === 'production') {
	function minifyJS() {
		return new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	}

	Module.frontend.plugins.push(minifyJS());
}

Module.server = {
	target: 'node',
	output: {
    filename: 'app.js'
  },
	module: {
		loaders: [
			{ test: /\.json$/, loader: 'json'},
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
		]
	},
	externals: nodeModules,
	node: {
		console: true
	},
	devtool: 'sourcemap'
};

module.exports = Module;
