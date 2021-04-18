import BaseCommand from '../structures/command/baseCommand.js';
import {centra} from '@nia3208/centra';
import {MessageEmbed} from 'discord.js';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class Getpkgbuild
 * @augments BaseCommand
 * @exports Getpkgbuild
 */
export default class Getpkgbuild extends BaseCommand {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, {
      name: 'aur --pkgbuild',
      usage: 'used to get pkgbuild for a package',
      aliases: ['aur pkgbuild'],
      example: prefix => `${prefix}${this.name} picom-git`,
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
    if (!args.length)
      return msg.reply({
        embed: new MessageEmbed()
          .setTitle('You must provide a package name!')
          .setColor('RED'),
      });
    const pkgbuild = await this.getPinfo(args.join(' '));
    this.tux.logger.log(pkgbuild, 'Success', 'ArchLinux-User-Repo-Results');
    if (pkgbuild.startsWith('<!DOCTYPE html>'))
      return msg.reply({
        embed: new MessageEmbed().setTitle('No results found').setColor('RED'),
      });
    return msg.channel.send(pkgbuild, {
      split: true,
      code: 'sh',
    });
  }

  /**
   * @async
   * @param {string} name - package name
   * @returns {Promise<string>} - PKGBUILD
   */
  async getPinfo(name) {
    return await centra('https://aur.archlinux.org/cgit/aur.git/plain/PKGBUILD')
      .query('h', name)
      .text();
  }
}
