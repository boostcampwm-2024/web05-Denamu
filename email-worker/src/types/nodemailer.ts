export interface NodeMailerError extends Error {
  code?: string;
  command?: string;
  response?: string;
  responseCode?: number;
}
