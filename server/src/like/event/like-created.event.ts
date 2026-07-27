export class LikeCreatedEvent {
  constructor(
    public readonly feedId: number,
    public readonly likerUserId: number,
  ) {}
}
