
export interface EnvConfig {
  apiUrl: string;
  apiTimeout: number;
}

declare global {
  const __DEV__: boolean;
}
