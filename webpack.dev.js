const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: './src/app/docfx.ts',
  devtool: 'eval-source-map',
  externals: {
    jquery: 'jQuery'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/template/bundles')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles.css' })
  ],
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.worker\.js$/,
        use: { 
          loader: "worker-loader"
         },
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
              sourceMap: false,
            }
          },
          'resolve-url-loader',
          {
            loader: "sass-loader",
            options: {
              sourceMap: false
            }
          }
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src/app"),
          path.resolve(__dirname, "node_modules/highlight.js/lib")
        ],
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