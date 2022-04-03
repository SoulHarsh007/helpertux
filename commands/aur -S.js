import BaseCommand from '../structures/command/baseCommand.js';
import {centra} from '@nia3208/centra';
import {MessageEmbed} from 'discord.js';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class InfoAur
 * @augments BaseCommand
 * @exports InfoAur
 */
export default class InfoAur extends BaseCommand {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, {
      name: 'aur -S',
      usage: 'used to get info for a aur package',
      example: prefix => `${prefix}${this.name} pipewire-git`,
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
    const {results, error} = await this.getPinfo(args.join(' '));
    if (error) {
      this.tux.logger.log(error, 'ERROR', 'Aur Error');
      return msg.reply({
        embed: new MessageEmbed().setTitle('AUR Error').setColor('RED'),
      });
    }
    this.tux.logger.log(results, 'Success', 'ArchLinux-User-Repo-Results');
    if (!results.length) {
      return msg.reply({
        embed: new MessageEmbed().setTitle('No results found').setColor('RED'),
      });
    }
    return msg.channel.send({
      embed: new MessageEmbed()
        .setTitle(`${results[0].Name} ${results[0].Version}`)
        .setColor('BLUE')
        .setURL(results[0].URL)
        .addFields([
          {
            name: 'Base:',
            value: `${results[0].PackageBase}`,
            inline: true,
          },
          {
            name: 'Desc:',
            value: `${results[0].Description}`,
            inline: true,
          },
          {
            name: 'Keywords:',
            value: results[0]?.Keywords?.toString() || 'None',
            inline: true,
          },
          {
            name: 'Licenses:',
            value: results[0]?.License?.toString() || 'None',
            inline: true,
          },
          {
            name: 'Maintainer:',
            value: results[0]?.Maintainer || 'Orphan',
            inline: true,
          },
          {
            name: 'Votes:',
            value: `${results[0]?.NumVotes}`,
            inline: true,
          },
          {
            name: 'Popularity:',
            value: `${results[0].Popularity}`,
            inline: true,
          },
          {
            name: 'First Submitted:',
            value: `${new Date(
              results[0].FirstSubmitted * 1000
            ).toUTCString()}`,
            inline: true,
          },
          {
            name: 'Last Updated:',
            value: `${new Date(results[0].LastModified * 1000).toUTCString()}`,
            inline: true,
          },
          {
            name: 'Flagged Out Of Date:',
            value: results[0].OutOfDate
              ? new Date(results[0].OutOfDate * 1000).toUTCString()
              : 'Not Flagged',
            inline: true,
          },
          {
            name: `Dependencies (${results[0]?.Depends?.length || 0}):`,
            value: results[0]?.Depends?.toString() || 'None',
            inline: true,
          },
          {
            name: `Optional Dependencies:`,
            value: `${
              results[0]?.OptDepends?.length || 0
            } optional dependencies`,
            inline: true,
          },
          {
            name: `Check Dependencies:`,
            value: `${
              results[0]?.CheckDepends?.length || 0
            } check dependencies`,
            inline: true,
          },
          {
            name: `Make Dependencies:`,
            value: `${results[0]?.MakeDepends?.length || 0} make dependencies`,
            inline: true,
          },
          {
            name: `Conflicts:`,
            value: results[0]?.Conflicts?.toString() || 'None',
            inline: true,
          },
          {
            name: `Provides:`,
            value: results[0]?.Provides?.toString() || 'None',
            inline: true,
          },
        ])
        .setAuthor(
          'SnapShot',
          'https://aur.archlinux.org/images/favicon.ico',
          `https://aur.archlinux.org${results[0].URLPath}`
        ),
    });
  }

  /**
   * @typedef {{ID: number, Name: string, PackageBaseID: number, PackageBase: string, Version: string, Description: string, URL: URL, NumVotes: number, Popularity: number, OutOfDate: number | null, Maintainer: string, FirstSubmitted: number, LastModified: number, URLPath: string, Depends?: string[], OptDepends?: string[], CheckDepends?: string[], MakeDepends?: string[], Conflicts?: string[],Provides?: string[], License: string[], Keywords?: string[], Replaces: string[]}[]} Results
   */

  /**
   * @async
   * @param {string} name - package name
   * @param {{}} filters - filters
   * @returns {Promise<{version: number, type: string, resultcount: number, results: Results, error?: string}>} - Package information
   */
  async getPinfo(name, filters = {}) {
    return centra('https://aur.archlinux.org/rpc/')
      .query({
        v: 5,
        type: 'info',
        arg: name,
      })
      .json();
  }
}
