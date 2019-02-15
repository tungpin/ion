import os from 'os';
import { join } from 'path';
import webpack from 'webpack';
import HappyPack from 'happypack';
import { CommanderStatic } from 'commander';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';

import merge from './util/merge';
import resolveConfig from './util/resolveConfig';
import getWebpackConfig from './config/getWebpackConfig';
import getBabelConfig from './config/getBabelConfig';
import { resolve } from './util/helper';
import chalk from 'chalk';

export default function build(program: CommanderStatic) {
  const cwdPath = process.cwd();
  // 构造出共享进程池
  const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

  process.env.NODE_ENV = 'production';

  const userConfig = resolveConfig(program.config);
  const webpackConfig = merge(getWebpackConfig(userConfig), {
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [join(cwdPath, 'src')],
          // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
          use: 'happypack/loader?id=babel',
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                outputPath: join(cwdPath, 'dist/images'),
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HappyPack({
        id: 'babel',
        // 如何处理 .js 文件，用法和 Loader 配置中一样
        loaders: [
          {
            loader: resolve('babel-loader'),
            options: getBabelConfig(userConfig),
          },
        ],
        // 使用共享进程池中的子进程去处理任务
        threadPool: happyThreadPool,
      }),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true,
      }),
      new CopyWebpackPlugin([
        {
          from: join(cwdPath, 'public'),
          to: join(cwdPath, 'dist'),
        },
      ]),
      new webpack.NamedModulesPlugin(),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|less)/,
            chunks: 'all',
            enforce: true,
          },
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 2, // 两个以上地方用到才打包到commons
          },
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
        },
      },
      runtimeChunk: true,
      namedModules: true,
      namedChunks: true,
    },
  });

  if (userConfig.sourceMap) {
    webpackConfig.devtool = 'source-map';
  }

  webpack(webpackConfig).run((err, stats) => {
    if (err) {
      console.log(chalk.red(err));
      return;
    }
  });
}