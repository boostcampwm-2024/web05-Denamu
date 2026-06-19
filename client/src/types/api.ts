export interface ApiMessage {
  message: string;
}

export interface ApiData<T> extends ApiMessage {
  data: T;
}
