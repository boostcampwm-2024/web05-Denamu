import axios from 'axios';
import Transport from 'winston-transport';

export class DiscordErrorTransport extends Transport {
  private readonly webhookUrl: string | undefined;

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
    this.webhookUrl = process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL;
  }

  log(info: { message: unknown }, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    if (this.webhookUrl) {
      axios
        .post(this.webhookUrl, {
          content: `🚨 [Feed Crawler Error] ${info.message as string}`,
        })
        .catch((e) => console.error('Discord 알림 전송 실패:', e));
    }

    callback();
  }
}
