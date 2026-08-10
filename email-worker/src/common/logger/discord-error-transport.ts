import axios from 'axios';
import Transport from 'winston-transport';

export class DiscordErrorTransport extends Transport {
  private webhookUrl: string | undefined;

  constructor() {
    super({ level: 'error' });
    this.webhookUrl = process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL;
  }

  log(info: { message: string }, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    if (this.webhookUrl) {
      axios
        .post(this.webhookUrl, {
          content: `🚨 [Email Worker Error] ${info.message}`,
        })
        .catch((error: unknown) => {
          console.error('Discord 알림 전송 실패:', error);
        });
    }

    callback();
  }
}
