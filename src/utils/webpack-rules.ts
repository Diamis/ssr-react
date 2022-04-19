import loaders from './webpack-loaders'
import { LoaderOptions } from '../types/global'

const styleLoaders = (options: LoaderOptions, hot = false) => {
  const styles = []
  const { isProd, loader, modules, postcssOptions = {} } = options

  if (hot) {
    styles.push(loaders.cssHot())
  }

  styles.push(loaders.miniCssExtract({}))
  styles.push(loaders.css({ isProd, modules }))
  styles.push(loaders.postcss({ isProd, ...(postcssOptions as LoaderOptions) }))

  if (loader) {
    styles.push(loader)
  }

  return styles
}

export default {
  js: (options: LoaderOptions) => ({
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    use: [loaders.js(options)],
  }),

  raw: (options: LoaderOptions) => ({
    test: /\.raw$/,
    use: [loaders.raw(options)],
  }),

  svg: (svgOptions: LoaderOptions, fileOptions: LoaderOptions) => ({
    test: /\.svg$/,
    use: [loaders.svgr(svgOptions), loaders.file(fileOptions)],
  }),

  yaml: (options: LoaderOptions) => ({
    test: /\.ya?ml$/,
    type: 'json',
    use: [loaders.yaml(options)],
  }),

  fonts: (options: LoaderOptions) => ({
    test: /\.(eot|otf|ttf|woff(2)?)(\?.*)?$/,
    use: [loaders.url(options)],
  }),

  media: (options: LoaderOptions) => ({
    test: /\.(mp4|webm|ogv|wav|mp3|m4a|aac|oga|flac)$/,
    use: [loaders.url(options)],
  }),

  images: (options: LoaderOptions) => ({
    test: /\.(ico|svg|jpg|jpeg|png|gif|webp|avif)(\?.*)?$/,
    use: [loaders.url(options)],
  }),

  assets: (options: LoaderOptions) => ({
    test: /\.pdf$/,
    use: [loaders.file(options)],
  }),

  css: (options: LoaderOptions, hot?: boolean): any => ({
    test: /\.css$/,
    exclude: /\.module\.css$/,
    use: styleLoaders(options, hot),
  }),

  cssModules: (options: LoaderOptions, hot?: boolean) => ({
    test: /\.module\.css$/,
    use: styleLoaders({ ...options, modules: true }, hot),
  }),

  scss: (options: LoaderOptions, hot?: boolean) => ({
    test: /\.scss$/,
    exclude: /\.module\.scss$/,
    use: styleLoaders(
      {
        ...options,
        loader: loaders.scss(options.scssOptions as LoaderOptions),
        postcssOptions: options.postcssOptions,
      },
      hot
    ),
  }),

  scssModules: (options: LoaderOptions, hot?: boolean) => ({
    test: /\.module\.scss$/,
    use: styleLoaders(
      {
        ...options,
        modules: true,
        loader: loaders.scss(options.scssOptions as LoaderOptions),
        postcssOptions: options.postcssOptions,
      },
      hot
    ),
  }),
}
