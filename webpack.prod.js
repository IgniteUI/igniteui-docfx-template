const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: './ts-source/docfx.ts',
  externals: {
    jquery: 'jQuery'
  },
  output: {
    filename: '[name].bundle.[chunkhash].js',
    path: path.resolve(__dirname, './dist/template/bundles')
  },

  plugins: [
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({filename: 'styles.bundle.[contenthash].css' }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      JQuery: 'jquery',
      jQuery: 'jquery'
    })
  ],
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: './'
            }
          },
          {
            loader: "css-loader",
          },
            'resolve-url-loader',
          {
            loader: "sass-loader",
          }
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules\/?!(highlight.js)\/)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ["@babel/plugin-proposal-class-properties"]
          }
        }
      }],
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  performance: {
    hints: false
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  }
}