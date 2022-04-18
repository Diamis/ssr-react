'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const babelConfig = require('./babel-config')

module.exports = {
  json: (options = {}) => ({
    loader: require.resolve('json-loader'),
    options,
  }),
  yaml: (options = {}) => ({
    loader: require.resolve('yaml-loader'),
    options,
  }),
  null: (options = {}) => ({
    loader: require.resolve('null-loader'),
    options,
  }),
  raw: (options = {}) => ({
    loader: require.resolve('raw-loader'),
    options,
  }),
  miniCssExtract: (options = {}) => ({
    loader: MiniCssExtractPlugin.loader,
    options,
  }),
  style: (options = {}) => ({
    loader: require.resolve('style-loader'),
    options,
  }),
  svgr: (options = {}) => ({
    loader: require.resolve('@svgr/webpack'),
    options: {
      titleProp: true,
      prettier: false,
      ref: true,
      svgo: false,
      svgoConfig: {
        plugins: [{ removeViewBox: false }],
      },
      ...options,
    },
  }),
  scss: (options = {}) => ({
    loader: require.resolve('sass-loader'),
    options,
  }),
  css: (options = {}) => {
    const { isProd, modules } = options
    let modulesOptions = false
    if (modules) {
      modulesOptions = {
        namedExport: true,
        localIdentName: '[name]_[local]_[contenthash:base64:5]',
        exportLocalsConvention: `dashesOnly`,
        exportOnlyLocals: true,
      }
    }

    if (typeof modules === 'object') {
      modulesOptions = { ...modulesOptions, ...modules }
    }

    return {
      loader: require.resolve('css-loader'),
      options: {
        sourceMap: !isProd,
        modules: modulesOptions,
      },
    }
  },
  postcss: (options = {}) => {
    const { isProd, postcssOptions = {}, ...loaderOptions } = options
    return {
      loader: require.resolve('postcss-loader'),
      options: {
        execute: false,
        sourceMap: !isProd,
        postcssOptions: {
          plugings: [require.resolve('postcss-import'), require.resolve('autoprefixer')],
          ...postcssOptions,
        },
        ...loaderOptions,
      },
    }
  },
  file: (options = {}) => ({
    loader: require.resolve('file-loader'),
    options: {
      name: `static/media/[name]-[hash].[ext]`,
      ...options,
    },
  }),
  url: (options = {}) => ({
    loader: require.resolve('url-loader'),
    options: {
      limit: 1000,
      name: `static/media/[name]-[hash].[ext]`,
      fallback: require.resolve(`file-loader`),
      ...options,
    },
  }),
  js: (options = {}) => {
    return {
      loader: require.resolve('babel-loader'),
      options: {
        presets: options.presets || babelConfig.presets,
        plugins: options.plugins || babelConfig.plugins,
      },
    }
  },
}
