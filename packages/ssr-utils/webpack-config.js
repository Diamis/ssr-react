const chalk = require('chalk')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const paths = require('ssr-utils/paths')
const { getClientEnvironment, getServerEnvironment } = require('ssr-utils/env')
const { STAGE_CLIENT, STAGE_SERVER, STAGE_DEV_CLIENT, STAGE_DEV_SERVER } = require('./webpack-utils')

const loaders = {
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
    let modulesOptions = false
    if (options.modules) {
      modulesOptions = {
        namedExport: true,
        localIdentName: '[name]_[local]_[contenthash:base64:5]',
        exportLocalsConvention: `dashesOnly`,
        exportOnlyLocals: isSSR,
      }
    }

    if (typeof options.modules === 'object') {
      modulesOptions = { ...modulesOptions, ...options.modules }
    }

    return {
      loader: require.resolve('css-loader'),
      options: {
        sourceMap: !isPRODUCTION,
        modules: modulesOptions,
      },
    }
  },
  postcss: (options = {}) => {
    const { postcssOptions = {}, ...loaderOptions } = options
    return {
      loader: require.resolve('postcss-loader'),
      options: {
        execute: false,
        sourceMap: !isPRODUCTION,
        postcssOptions: {
          plugings: [postcssImport, autoprefixer],
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
        presets: options.presets || [
          require('@babel/preset-env'),
          require('@babel/preset-react'),
          require('@babel/preset-typescript'),
        ],
        plugins: options.plugins || [require('@loadable/babel-plugin'), require('@babel/plugin-transform-runtime')],
      },
    }
  },
}

const createWebpackRules = (stage) => {
  const rules = {}

  rules.js = (options) => ({
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    use: [loaders.js(options)],
  })

  rules.yaml = (options) => ({
    test: /\.ya?ml$/,
    type: 'json',
    use: [loaders.yaml(options)],
  })

  rules.fonts = (options) => ({
    test: /\.(eot|otf|ttf|woff(2)?)(\?.*)?$/,
    use: [loaders.url(options)],
  })

  rules.images = (options) => ({
    test: /\.(ico|svg|jpg|jpeg|png|gif|webp|avif)(\?.*)?$/,
    use: [loaders.url(options)],
  })

  rules.media = (options) => ({
    test: /\.(mp4|webm|ogv|wav|mp3|m4a|aac|oga|flac)$/,
    use: [loaders.url(options)],
  })

  rules.assets = (options) => ({
    test: /\.pdf$/,
    use: [loaders.file(options)],
  })

  rules.raw = (options) => ({
    test: /\.raw$/,
    use: [loaders.raw(options)],
  })

  rules.svg = (svgOptions, fileOptions) => ({
    test: /\.svg$/,
    use: [loaders.svgr(svgOptions), loaders.file(fileOptions)],
  })

  // rules.css = (options = {}) => ({
  //   test: /\.css$/,
  //   exclude: /\.module\.css$/,
  //   use: scss(options),
  // })

  // rules.cssModules = (options = {}) => ({
  //   test: /\.module\.css$/,
  //   use: scss({ ...options, module: true }),
  // })

  // rules.scss = (options = {}) => ({
  //   test: /\.scss$/,
  //   exclude: /\.module\.scss$/,
  //   use: scss(options),
  // })

  // rules.scssModules = (options = {}) => ({
  //   test: /\.module\.scss$/,
  //   use: scss({ ...options, module: true }),
  // })

  return rules
}

/**
 * @param {String} stage dev-client|dev-server|server|client
 * @returns
 */
module.exports = (stage) => {
  const invalidStage = [STAGE_CLIENT, STAGE_SERVER, STAGE_DEV_CLIENT, STAGE_DEV_SERVER].every((key) => key !== stage)

  if (invalidStage) {
    console.log(chalk.red(`Invalid stage "${stage}"`))
  }

  function getEntry() {
    if (stage === STAGE_DEV_CLIENT) {
      return ['webpack-hot-middleware/client', paths.entry]
    }
    return paths.entry
  }

  function getOutput() {
    if (stage === STAGE_CLIENT || stage === STAGE_DEV_CLIENT) {
      return {
        path: paths.appBuild,
        filename: '[name].js',
        publicPath: '/',
        library: { type: 'commonjs' },
        chunkFilename: 'chunk-[name].js',
      }
    }

    return {
      path: paths.appBuild,
      filename: '[name]-[contenthash].js',
      publicPath: 'public/',
      chunkFilename: 'chunk-[name]-[contenthash].js',
    }
  }

  function getPlugins() {
    const plugins = []
    const providePlugin = {
      'fetch': require.resolve('node-fetch'),
      'global.fetch': require.resolve('node-fetch'),
    }

    switch (stage) {
      case STAGE_CLIENT:
        plugins.push(new webpack.DefinePlugin(getClientEnvironment().stringified))
        break
      case STAGE_DEV_CLIENT:
        plugins.push(new webpack.DefinePlugin(getClientEnvironment().stringified))
        plugins.push(new webpack.HotModuleReplacementPlugin())
        break
      case STAGE_SERVER:
      case STAGE_DEV_SERVER:
        plugins.push(new webpack.DefinePlugin(getServerEnvironment().stringified))
        plugins.push(new webpack.ProvidePlugin(providePlugin))
        break
    }

    return plugins
  }

  function getOptimization() {
    switch (stage) {
      case STAGE_DEV_SERVER:
        return { minimize: false }
      case STAGE_SERVER:
        return { minimize: true, minimizer: [new TerserPlugin()] }
      default:
        return {
          minimize: false,
          splitChunks: { cacheGroups: { default: false, defaultVendors: false } },
        }
    }
  }

  const rules = createWebpackRules(stage)

  return {
    name: stage,
    mode: process.env.NODE_ENV,
    target: stage.includes('server') ? 'node' : 'web',
    devtool: stage === STAGE_DEV_CLIENT ? 'eval-cheap-module-source-map' : 'source-map',

    entry: getEntry(),
    output: getOutput(),

    optimization: getOptimization(),
    plugins: getPlugins(),
    module: {
      rules: [
        rules.js(),
        rules.svg(),
        rules.raw(),
        rules.yaml(),
        rules.fonts(),
        rules.media(),
        rules.images(),
        rules.assets(),
      ],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      modules: ['node_modules', paths.appSrc],
      alias: {
        '@src': paths.appSrc,
      },
    },
  }
}
