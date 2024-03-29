import BaseEvent from '../structures/event/baseEvent.js';
import pacmonLoader from '../utils/pacmonLoader.js';
import {checkPackages, checkRepo} from '../utils/repoChecker.js';
import {
  cacheRepo,
  cacheTLDR,
  fetchRepo,
  fetchTLDR,
} from '../utils/repoSyncer.js';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @class Ready
 * @augments BaseEvent
 */
export default class Ready extends BaseEvent {
  /**
   * @class
   * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
   */
  constructor(tux) {
    super(tux, 'ready');
  }

  /**
   * @async
   * @function execute
   */
  async execute() {
    this.tux.logger.log(
      `Connected as ${this.tux.user.tag}`,
      'Connected!',
      'Ready'
    );
    await fetchRepo(this.tux);
    cacheRepo(this.tux);
    checkRepo(this.tux);
    setTimeout(() => checkPackages(this.tux), 10000);
    setInterval(async () => {
      this.tux.rebornRepo.clear();
      this.tux.outdated.clear();
      await fetchRepo(this.tux);
      cacheRepo(this.tux);
      checkRepo(this.tux);
      setTimeout(() => checkPackages(this.tux), 10000);
    }, 28800000);
    await fetchTLDR(this.tux);
    cacheTLDR(this.tux);
    pacmonLoader(this.tux);
    setInterval(() => pacmonLoader(this.tux), 3600000);
  }
}
