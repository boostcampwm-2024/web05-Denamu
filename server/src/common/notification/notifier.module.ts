import { Module } from '@nestjs/common';

import { DiscordNotifier } from '@common/notification/discord.notifier';
import { NotifierRegistry } from '@common/notification/notifier-registry';

@Module({
  providers: [
    DiscordNotifier,
    {
      provide: NotifierRegistry,
      useFactory: (discord: DiscordNotifier) => {
        const registry = new NotifierRegistry();
        registry.register('discord', discord);
        return registry;
      },
      inject: [DiscordNotifier],
    },
  ],
  exports: [NotifierRegistry],
})
export class NotifierModule {}
