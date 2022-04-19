const loaders = require('./webpack-loaders')

const styleLoaders = (options: LoaderOptions) => {
  const styles = []
  const { isProd, loader, modules, isExtractPlugin, postcssOptions = {} } = options
  const stylePlugin = isExtractPlugin ? loaders.miniCssExtract : loaders.style

  styles.push(stylePlugin({}))
  styles.push(loaders.css({ isProd, modules }))
  styles.push(loaders.postcss({ isProd, ...postcssOptions }))
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

  css: (options: LoaderOptions = {}) => ({
    test: /\.css$/,
    exclude: /\.module\.css$/,
    use: styleLoaders(options),
  }),

  cssModules: (options: LoaderOptions = {}) => ({
    test: /\.module\.css$/,
    use: styleLoaders({ ...options, modules: true }),
  }),

  scss: (options: LoaderOptions = {}) => ({
    test: /\.scss$/,
    exclude: /\.module\.scss$/,
    use: styleLoaders({
      ...options,
      loader: loaders.scss(options.scssOptions),
      postcssOptions: options.postcssOptions,
    }),
  }),

  scssModules: (options: LoaderOptions = {}) => ({
    test: /\.module\.scss$/,
    use: styleLoaders({
      ...options,
      modules: true,
      loader: loaders.scss(options.scssOptions),
      postcssOptions: options.postcssOptions,
    }),
  }),
}
