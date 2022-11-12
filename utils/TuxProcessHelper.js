import {readdirSync} from 'fs';
/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @async
 * @function load
 * @exports
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 */
export async function load(tux) {
  for (const file of readdirSync('./commands').filter(file =>
    file.endsWith('.js')
  )) {
    const {default: Command} = await import(`../commands/${file}`);
    const command = new Command(tux);
    tux.commands.set(command.name, command);
    command.aliases.forEach(x => tux.aliases.set(x, command));
    tux.logger.log(`${command.name} Loaded`, 'INFO', 'CommandLoader');
  }
  for (const file of readdirSync('./events/').filter(file =>
    file.endsWith('.js')
  )) {
    const {default: Event} = await import(`../events/${file}`);
    const event = new Event(tux);
    tux.logger.log(`${event.name} loaded!`, 'INFO', 'EventLoader');
    tux.on(event.name, (...args) => event.execute(...args));
  }
}
