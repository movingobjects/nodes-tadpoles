
const path              = require('path'),
      CopyWebpackPlugin = require('copy-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  entry: {
    app: './app/src/entry.js'
  },

  output: {
    path: path.resolve(__dirname, './app/build'),
    filename: 'resources/scripts/[name].bundle.js'
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      path.resolve(__dirname),
      'node_modules'
    ]
  },

  module: {
    rules: [

      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['env']
        }
      },

      {
        test: /\.paper.js$/,
        loader: "paper-loader"
      }

    ]
  },

  plugins: [
    /*new CopyWebpackPlugin([
      {
        from: 'app/src/static',
        to: 'resources'
      }
    ]),*/
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'app/src/index.html'
    })
  ]

};
