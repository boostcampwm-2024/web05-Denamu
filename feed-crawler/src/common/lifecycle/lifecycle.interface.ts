export interface Lifecycle {
  start?(): Promise<void> | void;
  stop?(): Promise<void> | void;
}
