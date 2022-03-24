import { RuleSetRule, WebpackPluginInstance } from 'webpack'
import { Plugin as PostCSSPlugin } from 'postcss'

import { Stage } from '../types'

export type WebpackConfigProps = {
  directory: string
  nodeEnv: string
  entry: string
  stage: Stage
}

export type Loader = string | { loader: string; options?: { [name: string]: any } }
export type LoaderResolver<T = Record<string, unknown>> = (option?: T) => Loader
export type LoaderOptions = Record<string, any>
export type RuleFactory<T = Record<string, unknown>> = (options?: T & LoaderOptions) => RuleSetRule
export type PluginFactory = (...args: any) => WebpackPluginInstance

export type CSSModulesOptions =
  | boolean
  | string
  | {
      mode?: 'local' | 'global' | 'pure' | ((resPath: string) => 'local' | 'global' | 'pure')
      auto?: boolean
      exportGlobals?: boolean
      localIdentName?: string
      localIdentContext?: string
      localIdentHashPrefix?: string
      namedExport?: boolean
      exportLocalsConvention?: 'asIs' | 'camelCaseOnly' | 'camelCase' | 'dashes' | 'dashesOnly'
      exportOnlyLocals?: boolean
    }

export interface ILoaders {
  style: LoaderResolver
  css: LoaderResolver<{
    url?: boolean | ((url: string, resourcePath: string) => boolean)
    import?: boolean | ((url: string, media: string, resourcePath: string) => boolean)
    modules?: CSSModulesOptions
    sourceMap?: boolean
    importLoaders?: number
    esModule?: boolean
  }>
  postcss: LoaderResolver<{
    browsers?: string[]
    overrideBrowserslist?: string[]
    postcssOptions?: {
      plugins?: PostCSSPlugin[] | ((loader: Loader) => PostCSSPlugin[])
    }
  }>
  scss: LoaderResolver

  js: LoaderResolver
  raw: LoaderResolver
  url: LoaderResolver
  file: LoaderResolver
  yaml: LoaderResolver
  json: LoaderResolver
  null: LoaderResolver

  miniCssExtract: LoaderResolver
  imports?: LoaderResolver
  exports?: LoaderResolver
}

export interface IRules {
  js: RuleFactory
  yaml: RuleFactory
  fonts: RuleFactory
  images: RuleFactory
  media: RuleFactory
  assets: RuleFactory
  scss: RuleFactory
  scssModules: RuleFactory
}

export interface IPlugins {
  fastRefresh: PluginFactory
}

export type CreateWebpackUtils = {
  rules: IRules
  loaders: ILoaders
  plugins: IPlugins
}
