export enum QnaStatus {
  PENDING = 'PENDING',
  ANSWERED = 'ANSWERED',
}

export enum QnaMessageType {
  QUESTION = 'QUESTION',
  ANSWER = 'ANSWER',
}

export const QNA_NOT_FOUND_MESSAGE = '존재하지 않는 문의입니다.';
export const QNA_VERIFY_FAIL_MESSAGE =
  '존재하지 않는 문의이거나 비밀번호가 일치하지 않습니다.';
