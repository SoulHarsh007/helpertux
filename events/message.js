import BaseEvent from '../structures/event/baseEvent.js';
import {prettyMS} from '@nia3208/pretty-ms';
import {MessageEmbed} from 'discord.js';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class Message
 * @augments BaseEvent
 */
export default class Message extends BaseEvent {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, 'message');
  }

  /**
   * @function execute
   * @param {import('discord.js').Message} msg - the message object
   * @returns {Promise<import('discord.js').Message> | void} - returns void or promise which resolves to discord.js message object
   */
  execute(msg) {
    if (
      msg.content.match(/<@(!|)807946103768612864>/gu) &&
      msg.content.toLowerCase().includes('help') &&
      !msg.author.bot &&
      msg.guild
    ) {
      return this.tux.commands.get('tux -h').execute(msg, []);
    } else if (
      msg.content.match(/<@(!|)807946103768612864>/gu) &&
      !msg.author.bot &&
      msg.guild
    ) {
      msg.reply({
        embed: new MessageEmbed()
          .setTitle('My prefix is `sudo `!')
          .setColor('BLUE'),
      });
    }
    if (
      !msg.content.toLowerCase().startsWith(this.tux.prefix) ||
      msg.author.bot ||
      !msg.guild
    ) {
      return;
    }
    const args = msg.content.slice(this.tux.prefix.length).split(' ');
    const command = `${args.shift().toLowerCase()} ${args.shift()}`;
    const cmd = this.tux.commands.get(command) || this.tux.aliases.get(command);
    if (cmd) {
      if (cmd.cooldowns.has(msg.author.id)) {
        const time = cmd.cooldowns.get(msg.author.id);
        if (time - Date.now() > 0) {
          return msg.reply({
            embed: new MessageEmbed()
              .setTitle(
                `Slow down a little! You can use this command after ${prettyMS(
                  time - Date.now(),
                  {compact: true}
                )}`
              )
              .setColor('RED'),
          });
        }
        cmd.cooldowns.delete(msg.author.id);
      }
      cmd.cooldowns.set(msg.author.id, Date.now() + cmd.cooldown);
      try {
        cmd.execute(msg, args);
        this.tux.logger.log(
          `${cmd.name} was executed in ${msg.guild.name} by ${msg.author.tag}`,
          'INFO',
          'Message Execution'
        );
      } catch (error) {
        this.tux.logger.log(error, 'Error', 'Failed to execute command');
        msg.reply({
          embed: new MessageEmbed()
            .setTitle(
              'Oh no! HelperTux ran into an error, this incident has been reported.'
            )
            .setColor(),
        });
      }
    }
  }
}
