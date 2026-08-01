export class CommentDeletedEvent {
  constructor(
    public readonly feedId: number,
    public readonly parentAuthorId: number | null,
  ) {}
}
