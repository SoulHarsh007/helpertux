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
      name: 'pacmon -i',
      usage: 'get pacmon status for your packages',
      example: prefix => `${prefix}${this.name}`,
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
    const uSub =
      (await this.tux.pacmon.get(msg.author.id)) ||
      (await this.tux.pacmon.set(msg.author.id, []));
    if (uSub.length) {
      let str = '';
      for (const x of uSub) {
        const {results} = await this.tux.commands
          .get('pacman -S')
          .getPinfo(x.name);
        console.log(
          '🚀 ~ file: pacmon -i.js ~ line 43 ~ SearchOfficial ~ execute ~ results',
          results
        );
        if (results.length) {
          const epoch = results[0].epoch ? `${results[0].epoch}:` : '';
          const version = `${epoch}${results[0].pkgver}-${results[0].pkgrel}`;
          if (x.version !== version) {
            str += `${x.name} - ${x.version} => ${version}\n`;
          } else {
            str += `${x.name} - ${x.version}\n`;
          }
        } else {
          str += `${x.name} - ${x.version} => PACKAGE-NOT-FOUND-IN-ARCH-REPO\n`;
        }
      }
      return msg.channel.send(str, {
        split: true,
        code: 'css',
      });
    }
    return msg.reply({
      embed: new MessageEmbed()
        .setTitle('You do not have any package subscriptions')
        .setColor('RED'),
    });
  }
}
