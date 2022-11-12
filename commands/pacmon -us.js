import BaseCommand from '../structures/command/baseCommand.js';
import {MessageEmbed} from 'discord.js';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class InfoOfficial
 * @augments BaseCommand
 * @exports InfoOfficial
 */
export default class SearchOfficial extends BaseCommand {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, {
      name: 'pacmon -us',
      usage: 'used to un-subscribe updates for an arch linux repo package',
      example: prefix => `${prefix}${this.name} firefox`,
      cooldown: 2500,
    });
  }

  /**
   * @async
   * @function execute
   * @param {import('discord.js').Message} msg - the message object
   * @param {string[]} args - arguments provided by user
   * @returns {Promise<import('discord.js').Message>} - returns a promise which resolves to discord.js message
   */
  async execute(msg, args) {
    if (!args.length) {
      return msg.reply({
        embed: new MessageEmbed()
          .setTitle('You must provide a package name!')
          .setColor('RED'),
      });
    }
    const uSub =
      (await this.tux.pacmon.get(msg.author.id)) ||
      (await this.tux.pacmon.set(msg.author.id, []));
    if (uSub.find(x => x.name !== args.join(' '))) {
      return msg.reply({
        embed: new MessageEmbed()
          .setTitle('You are not subscribed to this package!')
          .setColor('RED'),
      });
    } else {
      await this.tux.pacmon.pull(msg.author.id, x => x.name === args.join(' '));
      return msg.reply({
        embed: new MessageEmbed()
          .setTitle(`Subscription removed for: ${args.join(' ')}`)
          .setColor('RED'),
      });
    }
  }
}
