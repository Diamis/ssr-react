export type CommandArgs = {
  host: string;
  port: number;
  config?: string;
};

export type CommandsOptions = {
  startDevServer: (args: ArgumentsCamelCase<CommandArgs>) => void;
  startProdServer: (args: ArgumentsCamelCase<CommandArgs>) => void;
};

export type ConfigOption = {
  rootPath: string;
  buildPath: string;
  isProduction: boolean;
};

export type BuildOption = {
  customWebpackConfig: CustomWebpackConfigResult;
} & ConfigOption &
  Omit<CommandArgs, "config">;

export type ConfigServier = {
  host: string;
  port: number;
  rootPath: string;
  isProduction: boolean;
};

export type CustomWebpackConfigProps = {
  rootPath: string;
  configClient?: string;
  configServer?: string;
};

export type CustomWebpackConfigResult = {
  client: Record<string, unknown>;
  server: Record<string, unknown>;
};
