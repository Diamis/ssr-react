import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { LoaderOptions } from '../types/global'

export default {
  js: (options: LoaderOptions = {}) => {
    return {
      loader: require.resolve('babel-loader'),
      options: {
        plugins: [
          !options.isProd && require.resolve('react-refresh/babel'),
          require.resolve('@loadable/babel-plugin'),
          require.resolve('@babel/plugin-transform-runtime'),
          require.resolve('@babel/plugin-proposal-class-properties'),
        ].filter(Boolean),
        presets: [
          [require.resolve('@babel/preset-env'), { modules: 'commonjs' }],
          require.resolve('@babel/preset-react'),
          require.resolve('@babel/preset-typescript'),
        ],
      },
    }
  },
  json: (options: LoaderOptions) => ({
    loader: require.resolve('json-loader'),
    options,
  }),
  yaml: (options: LoaderOptions) => ({
    loader: require.resolve('yaml-loader'),
    options,
  }),
  null: (options: LoaderOptions) => ({
    loader: require.resolve('null-loader'),
    options,
  }),
  raw: (options: LoaderOptions) => ({
    loader: require.resolve('raw-loader'),
    options,
  }),
  miniCssExtract: (options: LoaderOptions) => ({
    loader: MiniCssExtractPlugin.loader,
    options,
  }),
  style: (options: LoaderOptions) => ({
    loader: require.resolve('style-loader'),
    options,
  }),
  svgr: (options: LoaderOptions) => ({
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
  scss: (options: LoaderOptions) => ({
    loader: require.resolve('sass-loader'),
    options,
  }),
  css: (options: LoaderOptions) => {
    const { isProd, modules } = options
    let modulesOptions: boolean | LoaderOptions = false
    if (modules) {
      modulesOptions = {
        namedExport: true,
        localIdentName: '[name]_[local]_[contenthash:base64:5]',
        exportLocalsConvention: `dashesOnly`,
        exportOnlyLocals: true,
      }
    }

    if (typeof modules === 'object') {
      modulesOptions = { ...modulesOptions, ...(modules as object) }
    }

    return {
      loader: require.resolve('css-loader'),
      options: {
        sourceMap: !isProd,
        modules: modulesOptions,
      },
    }
  },
  cssHot: () => ({
    loader: require.resolve('css-hot-loader'),
  }),
  postcss: (options: LoaderOptions) => {
    const { isProd, postcssOptions = {}, ...loaderOptions } = options
    return {
      loader: require.resolve('postcss-loader'),
      options: {
        execute: false,
        sourceMap: !isProd,
        postcssOptions: {
          plugings: [require.resolve('postcss-import'), require.resolve('autoprefixer')],
          ...(postcssOptions as any),
        },
        ...loaderOptions,
      },
    }
  },
  file: (options: LoaderOptions) => ({
    loader: require.resolve('file-loader'),
    options: {
      name: `static/media/[name]-[hash].[ext]`,
      ...options,
    },
  }),
  url: (options: LoaderOptions) => ({
    loader: require.resolve('url-loader'),
    options: {
      limit: 1000,
      name: `static/media/[name]-[hash].[ext]`,
      fallback: require.resolve(`file-loader`),
      ...options,
    },
  }),
}
