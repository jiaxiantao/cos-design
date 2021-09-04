/*
 * @Descripttion: default
 * @version: 1.0.0
 * @Author: jiaxiantao
 * @Date: 2021-08-24 17:47:29
 * @LastEditors: jiaxiantao
 * @LastEditTime: 2021-09-03 16:15:00
 */
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const NODE_ENV = process.env.NODE_ENV || false;
const BUILD_MODE = process.env.BUILD_MODE || false;
const isProduction = NODE_ENV === 'production' || false;
const isModuleBuild = BUILD_MODE === 'module' || false;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    index: isModuleBuild ? './src/components/index.tsx' : './src/index.tsx'
  }, //如果你将 entry 设置为一个 array，那么只有数组中的最后一个会被暴露成库
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, isModuleBuild ? 'lib' : 'dist'),
    library: {
      name: 'cosDesign',
      type: 'umd' // 以库的形式导出入口文件时，输出的类型,这里是通过umd的方式来暴露library,适用于使用方import的方式导入npm包
    }
  },
  // 实现代码分离
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'chunk' // 拆分 chunk 的名称。设为 false 将保持 chunk 的相同名称，因此不会不必要地更改名称。这是生产环境下构建的建议值。
    }
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(tsx|ts)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: 'cos-[path][name]__[local]--[hash:base64:5]'
              }
            }
          }
        ]
      },
      // 解决使用css modules时antd样式不生效
      {
        test: /\.css$/,
        // 排除业务模块，其他模块都不采用css modules方式解析
        exclude: [/src/],
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: 'cos-[path][name]__[local]--[hash:base64:5]'
              }
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 4000,
    open: true
  },
  externals: isModuleBuild
    ? {
        react: 'react',
        'react-dom': 'react-dom'
      }
    : {},
  plugins: [
    new MiniCssExtractPlugin({
      // 类似于 webpackOptions.output 中的选项
      // 所有选项都是可选的
      filename: 'css/[name].css'
    }),
    !isModuleBuild &&
      new htmlWebpackPlugin({
        template: 'public/index.html'
      }),
    isProduction && new CleanWebpackPlugin()
  ].filter(Boolean)
};
