export interface Notifier {
  sendAlert(message: string): Promise<void>;
}
