export class LikeDeletedEvent {
  constructor(
    public readonly feedId: number,
    public readonly likerUserId: number,
  ) {}
}
