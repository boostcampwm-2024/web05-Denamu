export class SubscriptionCreatedEvent {
  constructor(
    public readonly rssId: number,
    public readonly subscriberUserId: number,
    public readonly ownerUserId: number | null,
  ) {}
}
