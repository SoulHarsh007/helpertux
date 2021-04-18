import BaseCommand from '../structures/command/baseCommand.js';
import {centra} from '@nia3208/centra';
import {MessageEmbed} from 'discord.js';
import convert from 'pretty-bytes';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class SearchOfficial
 * @augments BaseCommand
 * @exports SearchOfficial
 */
export default class SearchOfficial extends BaseCommand {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, {
      name: 'pacman -Ss',
      usage: 'used to search official arch repos for a package',
      example: prefix => `${prefix}${this.name} coreutils`,
      cooldown: 2500,
    });
  }

  /**
   * @async
   * @function execute
   * @param {import('discord.js').Message} msg - the message object
   * @param {string[]} args - arguments provided by user
   * @returns {Promise<import('discord.js').Message | void>} - returns a promise which resolves to discord.js message
   */
  async execute(msg, args) {
    if (!args.length) {
      return msg.reply({
        embed: new MessageEmbed()
          .setTitle('You must provide a package name!')
          .setColor('RED'),
      });
    }
    const {results} = await this.getPinfo(args.join(' '));
    this.tux.logger.log(results, 'Success', 'ArchLinux-Repo-Results');
    if (!results.length) {
      return msg.reply({
        embed: new MessageEmbed().setTitle('No results found').setColor('RED'),
      });
    }
    msg.channel.send({
      content: `I found ${results.length} results for this query!`,
      embed: new MessageEmbed()
        .setTitle('Arch Linux Repo Search')
        .setColor('BLUE')
        .setDescription(
          results
            .map((x, i) => `#${i + 1} ${x.pkgname}`)
            .slice(0, 10)
            .join('\n')
        )
        .setFooter(
          'Results are limited to 10 per search. Respond with c to cancel or a number to get info, this expires after 10 seconds.'
        ),
    });
    try {
      const collected = await msg.channel.awaitMessages(
        m => m.author.id === msg.author.id,
        {
          max: 1,
          time: 10000,
          dispose: true,
          errors: ['time'],
        }
      );
      if (collected.first().content.toLowerCase() === 'c') {
        return;
      }
      const action = collected
        .first()
        .content.toLowerCase()
        .startsWith(this.tux.prefix)
        ? parseInt(collected.first().content.slice(this.tux.prefix.length), 10)
        : parseInt(collected.first().content, 10);
      if (isNaN(action) || action > 10 || action > results.length) {
        return;
      }
      const epoch = results[action - 1].epoch
        ? `${results[action - 1].epoch}:`
        : '';
      return msg.channel.send({
        embed: new MessageEmbed()
          .setTitle(
            `${results[action - 1].pkgname} ${epoch}${
              results[action - 1].pkgver
            }${results[action - 1].pkgrel}`
          )
          .setURL(results[action - 1].url)
          .setColor('BLUE')
          .addFields([
            {
              name: 'Arch:',
              value: results[action - 1].arch,
              inline: true,
            },
            {
              name: 'Repo:',
              value: results[action - 1].repo,
              inline: true,
            },
            {
              name: 'Base Package:',
              value: results[action - 1].pkgbase,
              inline: true,
            },
            {
              name: 'Desc:',
              value: results[action - 1].pkgdesc,
              inline: true,
            },
            {
              name: 'Licenses:',
              value: results[action - 1].licenses.toString(),
              inline: true,
            },
            {
              name: 'Groups:',
              value: results[action - 1].groups.length
                ? results[action - 1].groups.toString()
                : 'None',
              inline: true,
            },
            {
              name: 'Replaces:',
              value: results[action - 1].replaces.length
                ? results[action - 1].replaces.toString()
                : 'None',
              inline: true,
            },
            {
              name: 'Conflicts:',
              value: results[action - 1].conflicts.length
                ? results[action - 1].conflicts.toString()
                : 'None',
              inline: true,
            },
            {
              name: 'Provides:',
              value: results[action - 1].provides.length
                ? results[action - 1].provides.toString()
                : 'None',
              inline: true,
            },
            {
              name: 'Maintainers:',
              value: results[action - 1].maintainers.length
                ? results[action - 1].maintainers.toString()
                : 'None',
              inline: true,
            },
            {
              name: 'Package Size:',
              value: `${convert(
                results[action - 1].installed_size
              )} (Compressed: ${convert(results[action - 1].compressed_size)})`,
              inline: true,
            },
            {
              name: 'Packager:',
              value: results[action - 1].packager,
              inline: true,
            },
            {
              name: 'Build Date:',
              value: new Date(results[action - 1].build_date).toUTCString(),
              inline: true,
            },
            {
              name: 'Last Updated:',
              value: new Date(results[action - 1].last_update).toUTCString(),
              inline: true,
            },
            {
              name: 'Flagged:',
              value: results[action - 1].flag_date
                ? new Date(results[action - 1].flag_date).toUTCString()
                : 'Not Flagged',
              inline: true,
            },
            {
              name: `Dependencies (${results[action - 1].depends.length}):`,
              value: results[action - 1].depends
                ? results[action - 1].depends.toString()
                : 'None',
              inline: true,
            },
            {
              name: `Optional Dependencies (${
                results[action - 1].optdepends.length
              }):`,
              value: results[action - 1].optdepends.length
                ? results[action - 1].optdepends
                    .map(x => x.split(':').shift())
                    .toString()
                : 'None',
              inline: true,
            },
            {
              name: 'Make Dependencies:',
              value: `${
                results[action - 1].makedepends.length
              } make dependencies`,
              inline: true,
            },
            {
              name: 'Check Dependencies:',
              value: `${
                results[action - 1].checkdepends.length
              } make dependencies`,
              inline: true,
            },
          ]),
      });
    } catch (error) {
      this.tux.logger.log(error, 'INFO', 'SearchEmbedTimeout');
    }
  }

  /**
   * @typedef {{pkgname: string, pkgbase: string, repo: string, arch: string, pkgver: string, pkgrel: string, epoch: string, pkgdesc: string, url: URL, filename: string, compressed_size: number, installed_size: number, build_date: Date, last_update: Date, flag_date: Date | null, maintainers: string[], packager: string, groups: string[], licenses: string[], conflicts: string[], provides: string[], replaces: string[], depends: string[], optdepends: string[], makedepends: string[], checkdepends: string[]}[]} Results
   */

  /**
   * @async
   * @param {string} name - package name
   * @param {{}} filters - filters
   * @returns {Promise<{version: number, limit: number, valid: boolean, results: Results, num_pages: number, page: number}>} - Package information
   */
  async getPinfo(name, filters = {}) {
    return await centra('https://archlinux.org/packages/search/json/')
      .query('q', name)
      .json();
  }
}
