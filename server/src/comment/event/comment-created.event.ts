export class CommentCreatedEvent {
  constructor(
    public readonly feedId: number,
    public readonly commenterUserId: number,
    public readonly parentAuthorId: number | null,
  ) {}
}
