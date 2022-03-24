import path from 'path'
import { Stage } from 'types'
import { RuleSetRule } from 'webpack'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'

import * as WebpackTypes from './webpack.types'

export const createWebpackUtils = (stage: Stage): WebpackTypes.CreateWebpackUtils => {
  const assetRelativeRoot = `static/`

  const isPRODUCTION = !stage.includes('develop')
  const isSSR = stage.includes('html')

  const loaders: WebpackTypes.ILoaders = {
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
    style: (options = {}) => ({
      loader: require.resolve('style-loader'),
      options,
    }),
    miniCssExtract: (options = {}) => ({
      loader: MiniCssExtractPlugin.loader,
      options,
    }),
    css: (options = {}) => {
      let modulesOptions: WebpackTypes.CSSModulesOptions = false
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
    scss: (options = {}) => ({
      loader: require.resolve('sass-loader'),
      options,
    }),
    file: (options = {}) => ({
      loader: require.resolve('file-loader'),
      options: {
        name: `${assetRelativeRoot}[name]-[hash].[ext]`,
        ...options,
      },
    }),
    url: (options = {}) => ({
      loader: require.resolve('url-loader'),
      options: {
        limit: 1000,
        name: `${assetRelativeRoot}[name]-[hash].[ext]`,
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

  const rules = {} as WebpackTypes.IRules

  rules.js = (options = {}) => ({
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    use: [loaders.js(options)],
  })

  rules.yaml = (options = {}) => ({
    test: /\.ya?ml$/,
    type: 'json',
    use: [loaders.yaml(options)],
  })

  rules.fonts = (options = {}) => ({
    test: /\.(eot|otf|ttf|woff(2)?)(\?.*)?$/,
    use: [loaders.url(options)],
  })

  rules.images = (options = {}) => ({
    test: /\.(ico|svg|jpg|jpeg|png|gif|webp|avif)(\?.*)?$/,
    use: [loaders.url(options)],
  })

  rules.media = (options = {}) => ({
    test: /\.(mp4|webm|ogv|wav|mp3|m4a|aac|oga|flac)$/,
    use: [loaders.url(options)],
  })

  rules.assets = (options = {}) => ({
    test: /\.pdf$/,
    use: [loaders.file(options)],
  })

  const scss = (options = {} as WebpackTypes.LoaderOptions) => {
    const { browsers, ...restOptions } = options
    return [
      !isSSR && loaders.miniCssExtract(restOptions),
      loaders.css({ ...restOptions, importLoaders: 1 }),
      loaders.postcss({ browsers }),
      loaders.scss(),
    ].filter(Boolean) as RuleSetRule['use']
  }

  rules.scss = (options = {}) => ({
    test: /\.scss$/,
    exclude: /\.module\.s?css$/,
    use: scss(options),
  })

  rules.scssModules = (options = {}) => ({
    test: /\.module\.s?css$/,
    use: scss({ ...options, module: true }),
  })

  const plugins: WebpackTypes.IPlugins = {
    fastRefresh: () =>
      new ReactRefreshWebpackPlugin({
        exclude: /node_modules/,
        overlay: {
          sockIntegration: 'whm',
          module: path.join(__dirname, `fast-refresh-module`),
        },
      }),
  }

  return { rules, loaders, plugins }
}
