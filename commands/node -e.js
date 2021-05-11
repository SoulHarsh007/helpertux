import BaseCommand from '../structures/command/baseCommand.js';
import {inspect} from 'util';
import {StopWatch} from '../utils/stopWatch.js';
import {asyncDetect} from '../utils/asyncDetector.js';
import {classId} from '../utils/classId.js';
import {MessageEmbed} from 'discord.js';
import {sanitize} from '../utils/sanitize.js';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class Eval
 * @augments BaseCommand
 */
export default class Eval extends BaseCommand {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, {
      name: 'node -e',
      hidden: false,
      example: prefix => `${prefix}${this.name} process.version`,
      usage: 'used to evaluate nodejs code',
    });
  }

  /**
   * @async
   * @function execute
   * @param {import('discord.js').Message} msg - The message object
   * @param {string[]} args - arguments provided by user
   * @returns {Promise<import('discord.js').Message> | Promise<void>} - returns void or promise which resolves to discord.js message object
   */
  async execute(msg, args) {
    if (
      msg.author.id !== process.env.OWNERID &&
      msg.author.id !== process.env.COOWNERID
    ) {
      return msg.reply({
        embed: new MessageEmbed()
          .setTitle(
            'Username is not in the sudoers file. This incident will be reported.'
          )
          .setColor('RED'),
      });
    }
    const Args = args
      .filter(x => x.startsWith('--'))
      .map(x => x.replace('--', '').toLowerCase());
    const code = Args.includes('async')
      ? `(async () => {\n${args
          .filter(x => !x.startsWith('--'))
          .join(' ')}\n})()`
      : args.filter(x => !x.startsWith('--')).join(' ');
    const stopwatch = new StopWatch();
    let syncTime;
    let asyncTime;
    let result;
    let type;
    let thenable = false;
    try {
      result = eval(code);
      syncTime = stopwatch.toString();
      type = classId(result);
      if (asyncDetect(result)) {
        thenable = true;
        stopwatch.restart();
        result = await result;
        type = classId(result);
        asyncTime = stopwatch.toString();
      }
    } catch (e) {
      if (!syncTime) {
        syncTime = stopwatch.toString();
      }
      if (!type) {
        type = classId(e);
      }
      if (thenable && !asyncTime) {
        asyncTime = stopwatch.toString();
      }
      if (e?.stack) {
        this.tux.logger.log(
          e.stack,
          type,
          asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`
        );
        result = e;
      }
    }
    stopwatch.stop();
    if (typeof result !== 'string') {
      result = inspect(result, {
        depth: Args.includes(/depth=*/gu)
          ? parseInt(
              Args.filter(x => x.startsWith('depth=')[0].replace('depth=', '')),
              10
            ) || 0
          : 0,
        showHidden: Args.includes('showhidden'),
      });
    }
    if (Args.includes('silent')) {
      return this.tux.logger.log(result, type, 'Evaled Successfully!');
    }
    if (Args.includes('no-limit')) {
      const res = asyncTime
        ? `⏱ Evaluation took: ${asyncTime}<${syncTime}>`
        : `⏱ Evaluation took: ${syncTime}`;
      return msg.channel.send(`${result}\n${res} ${type}`, {
        split: true,
        code: 'css',
      });
    }
    msg.channel.send({
      embed: new MessageEmbed()
        .setTitle('Eval Result')
        .addFields([
          {
            name: 'Input:',
            value: `\`\`\`js\n${code}\`\`\``,
            inline: true,
          },
          {
            name: 'Output:',
            value: `\`\`\`js\n${sanitize(process.env.TOKEN, result)}\`\`\``,
            inline: true,
          },
          {
            name: 'Output Type:',
            value: `\`\`\`ts\n${type}\`\`\``,
            inline: true,
          },
        ])
        .setFooter(
          asyncTime
            ? `⏱ Evaluation took: ${asyncTime}<${syncTime}>`
            : `⏱ Evaluation took: ${syncTime}`
        ),
    });
  }
}
