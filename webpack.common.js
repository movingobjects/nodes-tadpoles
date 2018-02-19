
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
        include: [
          path.resolve(__dirname, 'app'),
          path.resolve(__dirname, 'node_modules/varyd-utils')
        ],
        options: {
          presets: ['env'],
          plugins: [
            'transform-object-rest-spread',
            'transform-class-properties'
          ],
        }
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
