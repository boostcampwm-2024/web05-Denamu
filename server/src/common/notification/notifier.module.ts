import { Module } from '@nestjs/common';

import { DiscordNotifier } from '@common/notification/discord.notifier';
import { NotifierRegistry } from '@common/notification/notifier-registry';
import {
  QNA_NOTIFIER,
  REPORT_NOTIFIER,
  RSS_NOTIFIER,
  SERVER_NOTIFIER,
} from '@common/notification/notifier.constant';

@Module({
  providers: [
    {
      provide: SERVER_NOTIFIER,
      useFactory: () => {
        const registry = new NotifierRegistry();
        registry.register(
          'discord',
          new DiscordNotifier(process.env.SERVER_DISCORD_WEBHOOK_URL ?? ''),
        );
        return registry;
      },
    },
    {
      provide: RSS_NOTIFIER,
      useFactory: () => {
        const registry = new NotifierRegistry();
        registry.register(
          'discord',
          new DiscordNotifier(process.env.RSS_DISCORD_WEBHOOK_URL ?? ''),
        );
        return registry;
      },
    },
    {
      provide: REPORT_NOTIFIER,
      useFactory: () => {
        const registry = new NotifierRegistry();
        registry.register(
          'discord',
          new DiscordNotifier(process.env.REPORT_DISCORD_WEBHOOK_URL ?? ''),
        );
        return registry;
      },
    },
    {
      provide: QNA_NOTIFIER,
      useFactory: () => {
        const registry = new NotifierRegistry();
        registry.register(
          'discord',
          new DiscordNotifier(process.env.QNA_DISCORD_WEBHOOK_URL ?? ''),
        );
        return registry;
      },
    },
  ],
  exports: [SERVER_NOTIFIER, RSS_NOTIFIER, REPORT_NOTIFIER, QNA_NOTIFIER],
})
export class NotifierModule {}
