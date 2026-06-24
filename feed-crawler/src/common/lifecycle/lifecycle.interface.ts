export interface Lifecycle {
  stop(): Promise<void> | void;
}
