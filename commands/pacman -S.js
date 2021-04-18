import BaseCommand from '../structures/command/baseCommand.js';
import {centra} from '@nia3208/centra';
import {MessageEmbed} from 'discord.js';
import convert from 'pretty-bytes';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
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
      name: 'pacman -S',
      usage: 'used to get info for a arch linux repo package',
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
    const {results} = await this.getPinfo(args.join(' '));
    this.tux.logger.log(results, 'Success', 'ArchLinux-Repo-Results');
    if (!results.length) {
      return msg.reply({
        embed: new MessageEmbed().setTitle('No results found').setColor('RED'),
      });
    }
    const epoch = results[0].epoch ? `${results[0].epoch}:` : '';
    return msg.channel.send({
      embed: new MessageEmbed()
        .setTitle(
          `${results[0].pkgname} ${epoch}${results[0].pkgver}${results[0].pkgrel}`
        )
        .setURL(results[0].url)
        .setColor('BLUE')
        .addFields([
          {
            name: 'Arch:',
            value: results[0].arch,
            inline: true,
          },
          {
            name: 'Repo:',
            value: results[0].repo,
            inline: true,
          },
          {
            name: 'Base Package:',
            value: results[0].pkgbase,
            inline: true,
          },
          {
            name: 'Desc:',
            value: results[0].pkgdesc,
            inline: true,
          },
          {
            name: 'Licenses:',
            value: results[0].licenses.toString(),
            inline: true,
          },
          {
            name: 'Groups:',
            value: results[0].groups.length
              ? results[0].groups.toString()
              : 'None',
            inline: true,
          },
          {
            name: 'Replaces:',
            value: results[0].replaces.length
              ? results[0].replaces.toString()
              : 'None',
            inline: true,
          },
          {
            name: 'Conflicts:',
            value: results[0].conflicts.length
              ? results[0].conflicts.toString()
              : 'None',
            inline: true,
          },
          {
            name: 'Provides:',
            value: results[0].provides.length
              ? results[0].provides.toString()
              : 'None',
            inline: true,
          },
          {
            name: 'Maintainers:',
            value: results[0].maintainers.length
              ? results[0].maintainers.toString()
              : 'None',
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
            value: results[0].packager,
            inline: true,
          },
          {
            name: 'Build Date:',
            value: new Date(results[0].build_date).toUTCString(),
            inline: true,
          },
          {
            name: 'Last Updated:',
            value: new Date(results[0].last_update).toUTCString(),
            inline: true,
          },
          {
            name: 'Flagged:',
            value: results[0].flag_date
              ? new Date(results[0].flag_date).toUTCString()
              : 'Not Flagged',
            inline: true,
          },
          {
            name: `Dependencies (${results[0].depends.length}):`,
            value: results[0].depends.length
              ? results[0].depends.toString()
              : 'None',
            inline: true,
          },
          {
            name: `Optional Dependencies (${results[0].optdepends.length}):`,
            value: results[0].optdepends.length
              ? results[0].optdepends.map(x => x.split(':').shift()).toString()
              : 'None',
            inline: true,
          },
          {
            name: 'Make Dependencies:',
            value: `${results[0].makedepends.length} make dependencies`,
            inline: true,
          },
          {
            name: 'Check Dependencies:',
            value: `${results[0].checkdepends.length} make dependencies`,
            inline: true,
          },
        ]),
    });
  }

  /**
   * @typedef {{pkgname: string, pkgbase: string, repo: string, arch: string, pkgver: string, pkgrel: string, epoch: string, pkgdesc: string, url: URL, filename: string, compressed_size: number, installed_size: number, build_date: string, last_update: string, flag_date: string | null, maintainers: string[], packager: string, groups: string[], licenses: string[], conflicts: string[], provides: string[], replaces: string[], depends: string[], optdepends: string[], makedepends: string[], checkdepends: string[]}[]} Results
   */

  /**
   * @async
   * @param {string} name - package name
   * @param {{}} filters - filters
   * @returns {Promise<{version: number, limit: number, valid: boolean, results: Results, num_pages: number, page: number}>} - Package information
   */
  async getPinfo(name, filters = {}) {
    return await centra('https://archlinux.org/packages/search/json/')
      .query({
        name,
      })
      .json();
  }
}
