export interface Notifier {
  initialize(): void;
  //todo: eventName을 constant로 관리하기
  publish(eventName: string, payload: unknown): void;
}
