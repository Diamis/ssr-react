export enum Stage {
  DEV_CLIENT = 'dev-client',
  DEV_SERVER = 'dev-server',
  SERVER = 'server',
  CLIENT = 'client',
}

export type LoaderOptions = Record<string, string | number | boolean | object>
