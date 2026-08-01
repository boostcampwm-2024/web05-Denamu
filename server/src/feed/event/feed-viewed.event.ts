export class FeedViewedEvent {
  constructor(
    public readonly feedId: number,
    public readonly userId: number,
  ) {}
}
