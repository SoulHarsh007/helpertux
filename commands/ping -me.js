import BaseCommand from '../structures/command/baseCommand.js';
import {version, MessageEmbed} from 'discord.js';
import {cpus} from 'os';
import {prettyMS} from '@nia3208/pretty-ms';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class Ping
 * @augments BaseCommand
 */
export default class Ping extends BaseCommand {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, {
      name: 'ping -me',
      hidden: false,
      aliases: ['ping -localhost'],
      usage: 'used to check bots ping and other info',
      example: prefix => `${prefix}${this.name}`,
    });
  }

  /**
   * @async
   * @param {import('discord.js').Message} msg -
   * @param {string[]} args - arguments provided by user
   */
  async execute(msg, args) {
    const uptime = prettyMS(this.tux.uptime, {
      verbose: true,
    });
    const oldMsg = await msg.channel.send('Pinging...');
    oldMsg.edit({
      content: '\u200B',
      embed: new MessageEmbed()
        .setColor('0xFF0000')
        .setTitle("tux's stats")
        .setDescription(
          `Discord.js version: v${version}\nNode version: ${process.version}\nUptime: ${uptime}` +
            `\nCPU information: ${cpus()[0].model} \nRam usage: ${(
              process.memoryUsage().rss /
              (1204 * 1024)
            ).toPrecision(4)}MB\nPing: ${this.tux.ws.ping}ms\nRoundtrip: ${
              Date.now() - oldMsg.createdTimestamp
            }ms`
        )
        .setColor('0xff0000'),
    });
  }
}
