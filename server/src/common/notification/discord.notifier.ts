import axios from 'axios';

import { Notifier } from '@common/notification/notifier.interface';

export class DiscordNotifier implements Notifier {
  constructor(private readonly webhookUrl: string) {}

  async sendAlert(message: string): Promise<void> {
    if (!this.webhookUrl) return;
    try {
      await axios.post(this.webhookUrl, { content: message });
    } catch {
      // notification failure must not disrupt error handling
    }
  }
}
