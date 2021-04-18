import BaseEvent from '../structures/event/baseEvent.js';
import {prettyMS} from '@nia3208/pretty-ms';
import {MessageEmbed} from 'discord.js';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class MessageUpdate
 * @augments BaseEvent
 */
export default class MessageUpdate extends BaseEvent {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, 'messageUpdate');
  }

  /**
   * @function execute
   * @param {import('discord.js').Message} msg - the message object
   * @param {import('discord.js').Message} newMsg - the message object
   * @returns {Promise<import('discord.js').Message> | void} - returns void or promise which resolves to discord.js message object
   */
  execute(msg, newMsg) {
    if (
      !newMsg.content.toLowerCase().startsWith(this.tux.prefix) ||
      newMsg.author.bot ||
      !newMsg.guild
    ) {
      return;
    }
    if (newMsg.mentions.has(this.tux.id) && newMsg.content.includes('help')) {
      return this.tux.commands.execute(newMsg, []);
    }
    const args = newMsg.content.slice(this.tux.prefix.length).split(' ');
    const command = `${args.shift().toLowerCase()} ${args.shift()}`;
    const cmd = this.tux.commands.get(command) || this.tux.aliases.get(command);
    if (cmd) {
      if (cmd.cooldowns.has(newMsg.author.id)) {
        const time = cmd.cooldowns.get(newMsg.author.id);
        if (time - Date.now() > 0) {
          return newMsg.reply({
            embed: new MessageEmbed()
              .setTitle(
                `Slow down a little! You can use this command after ${prettyMS(
                  time - Date.now(),
                  {
                    compact: true,
                  }
                )}`
              )
              .setColor('RED'),
          });
        }
        cmd.cooldowns.delete(newMsg.author.id);
      }
      cmd.cooldowns.set(newMsg.author.id, Date.now() + cmd.cooldown);
      try {
        cmd.execute(newMsg, args);
        this.tux.logger.log(
          `${cmd.name} was executed in ${newMsg.guild.name} by ${newMsg.author.tag}`,
          'INFO',
          'MessageUpdate Execution'
        );
      } catch (error) {
        this.tux.logger.log(error, 'Error', 'Failed to execute command');
        newMsg.reply({
          embed: new MessageEmbed()
            .setTitle(
              'Oh no! HelperTux ran into an error, this incident has been reported.'
            )
            .setColor('RED'),
        });
      }
    }
  }
}
