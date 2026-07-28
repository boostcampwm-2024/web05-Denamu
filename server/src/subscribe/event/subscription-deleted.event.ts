export class SubscriptionDeletedEvent {
  constructor(
    public readonly rssId: number,
    public readonly subscriberUserId: number,
  ) {}
}
