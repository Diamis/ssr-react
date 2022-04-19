enum Stage {
  DEV_CLIENT = 'dev-client',
  DEV_SERVER = 'dev-server',
  SERVER = 'server',
  CLIENT = 'client',
}

type LoaderOptions = Record<string, string | number | boolean | LoaderOptions>
