const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: './src/docfx.ts',
  externals: {
    jquery: 'jQuery'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './dist/template/bundles'),
    clean: true
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles-bundle.min.css' })
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
            options: {
              sourceMap: true
            }
          },
          'resolve-url-loader',
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
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
  optimization: {
    moduleIds: 'deterministic',
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