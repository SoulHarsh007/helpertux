import BaseCommand from '../structures/command/baseCommand.js';
import {MessageEmbed} from 'discord.js';
import convert from 'pretty-bytes';

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
      name: 'pacmon -s',
      usage: 'used to subscribe updates for an arch linux repo package',
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
    if (uSub.find(x => x.name === args.join(' '))) {
      return msg.reply({
        embed: new MessageEmbed()
          .setTitle('You are already subscribed to this package!')
          .setColor('RED'),
      });
    }
    const {results} = await this.tux.commands
      .get('pacman -S')
      .getPinfo(args.join(' '));
    this.tux.logger.log(results, 'Success', 'ArchLinux-Repo-Results');
    if (!results.length) {
      return msg.reply({
        embed: new MessageEmbed().setTitle('No results found').setColor('RED'),
      });
    }
    const epoch = results[0].epoch ? `${results[0].epoch}:` : '';
    const pkg = {
      name: results[0].pkgname,
      version: `${epoch}${results[0].pkgver}-${results[0].pkgrel}`,
    };
    await this.tux.pacmon.push(msg.author.id, pkg);
    return msg.reply({
      embed: new MessageEmbed()
        .setTitle(
          `Subscribed to: ${results[0].pkgname} ${epoch}${results[0].pkgver}${results[0].pkgrel}`
        )
        .setURL(results[0].url)
        .setColor('BLUE')
        .addFields([
          {
            name: 'Arch:',
            value: `${results[0]?.arch}`,
            inline: true,
          },
          {
            name: 'Repo:',
            value: `${results[0]?.repo}`,
            inline: true,
          },
          {
            name: 'Base Package:',
            value: `${results[0]?.pkgbase}`,
            inline: true,
          },
          {
            name: 'Package Size:',
            value: `${convert(
              results[0].installed_size
            )} (Compressed: ${convert(results[0].compressed_size)})`,
            inline: true,
          },
          {
            name: 'Packager:',
            value: `${results[0].packager}`,
            inline: true,
          },
          {
            name: 'Build Date:',
            value: `${new Date(results[0].build_date).toUTCString()}`,
            inline: true,
          },
          {
            name: 'Last Updated:',
            value: `${new Date(results[0].last_update).toUTCString()}`,
            inline: true,
          },
        ])
        .setFooter('Polling frequency is configured to 12 hours'),
    });
  }
}
