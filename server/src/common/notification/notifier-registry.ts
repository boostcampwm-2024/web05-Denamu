import { Injectable } from '@nestjs/common';

import { Notifier } from '@common/notification/notifier.interface';

@Injectable()
export class NotifierRegistry implements Notifier {
  private readonly notifiers = new Map<string, Notifier>();

  register(name: string, notifier: Notifier): void {
    this.notifiers.set(name, notifier);
  }

  async sendAlert(message: string): Promise<void> {
    await Promise.allSettled(
      [...this.notifiers.values()].map((n) => n.sendAlert(message)),
    );
  }
}
