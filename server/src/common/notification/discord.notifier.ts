import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { Notifier } from '@common/notification/notifier.interface';

@Injectable()
export class DiscordNotifier implements Notifier {
  private readonly webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SERVER_DISCORD_WEBHOOK_URL ?? '';
  }

  async sendAlert(message: string): Promise<void> {
    if (!this.webhookUrl) return;
    try {
      await axios.post(this.webhookUrl, { content: message });
    } catch {
      // notification failure must not disrupt error handling
    }
  }
}
