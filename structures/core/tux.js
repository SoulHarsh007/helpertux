import {Client, Collection} from 'discord.js';
import {Logger} from '../logger/logger.js';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @augments Client
 * @class HelperTux
 * @classdesc HelperTux extends client to add some cool features like logging!
 * @exports HelperTux
 */
export class HelperTux extends Client {
  /**
   * @class
   */
  constructor() {
    super({
      shards: 'auto',
      messageCacheMaxSize: 5,
      messageCacheLifetime: 15,
      messageSweepInterval: 25,
      messageEditHistoryMaxSize: 2,
      disableMentions: 'everyone',
      ws: {
        intents: ['GUILDS', 'GUILD_MESSAGES'],
        compress: true,
      },
      presence: {
        activity: {
          name: 'sudo tux -h',
          type: 'PLAYING',
        },
      },
    });
    this.prefix = 'sudo ';
    this.logger = new Logger();
    this.aliases = new Collection();
    this.commands = new Collection();
    this.rebornRepo = new Collection();
    this.tldr = new Collection();
    this.outdated = new Collection();
  }
}
