import BaseCommand from '../structures/command/baseCommand.js';
import {centra} from '@nia3208/centra';
import {MessageEmbed} from 'discord.js';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class SearchAur
 * @augments BaseCommand
 * @exports SearchAur
 */
export default class SearchAur extends BaseCommand {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, {
      name: 'aur -Ss',
      usage: 'used to search aur for a package',
      example: prefix => `${prefix}${this.name} powerpill`,
      cooldown: 2000,
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
    const Args = args
      .filter(x => x.startsWith('--'))
      .map(x => x.replace('--', '').toLowerCase());
    const {results, error} = await this.getPinfo(
      args.filter(x => !x.startsWith('--')).join(' ')
    );
    if (error) {
      this.tux.logger.log(error, 'ERROR', 'Aur Error');
      return msg.reply(`AUR Error: ${error}`);
    }
    if (Args.filter(x => x.match(/sort=[a-z]*|s=[a-z]*/gu)).length) {
      const sorter =
        Args.filter(x => x.match(/sort=[a-z]*|s=[a-z]*/gu))[0].replace(
          /sort=*|s=*/gu,
          ''
        ) === 'votes'
          ? 'NumVotes'
          : 'Popularity';
      results.sort((a, b) => b[sorter] - a[sorter]);
    }
    this.tux.logger.log(results, 'Success', 'ArchLinux-User-Repo-Results');
    if (!results.length) {
      return msg.reply({
        embed: new MessageEmbed().setTitle('No results found').setColor('RED'),
      });
    }
    return msg.channel.send({
      content: `I found ${results.length} results for this query!`,
      embed: new MessageEmbed()
        .setTitle('Arch Linux User Repo Search')
        .setColor('BLUE')
        .setDescription(
          results
            .map((x, i) => `#${i + 1} ${x.Name}`)
            .slice(0, 10)
            .join('\n')
        )
        .setFooter('Results are limited to 10 per search!'),
    });
  }

  /**
   * @typedef {{ID: number, Name: string, PackageBaseID: number, PackageBase: string, Version: string, Description: string, URL: URL, NumVotes: number, Popularity: number, OutOfDate: number | null, Maintainer: string, FirstSubmitted: number, LastModified: number, URLPath: string}[]} Results
   */

  /**
   * @async
   * @param {string} name - package name
   * @returns {Promise<{version: number, type: string, resultcount: number, results: Results, error?: string}>} - Package information
   */
  async getPinfo(name) {
    return await centra('https://aur.archlinux.org/rpc/')
      .query({v: 5, type: 'search', by: 'name-desc', arg: name})
      .json();
  }
}
