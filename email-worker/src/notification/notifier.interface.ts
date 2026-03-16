export interface Notifier {
  start(): void;
  //todo: eventName을 constant로 관리하기
  callEvent(eventName: string, payload: unknown): void;
}
