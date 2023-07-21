import {centra} from '@nia3208/centra';
import {prettyMS} from '@nia3208/pretty-ms';
import {execFileSync} from 'child_process';
import {Collection, MessageEmbed} from 'discord.js';
import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'fs';
import privateBin from './privateBin.js';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @function cacheRepo
 * @param {Collection} targetRepo - the target repository collection
 * @description used to cache fetched repo files
 */
export function cacheRepo(targetRepo) {
  targetRepo.clear();
  readdirSync('./repo/check').forEach(x => {
    const json = {};
    readFileSync(`./repo/check/${x}/desc`, 'utf-8')
      .trim()
      .split('\n\n')
      .map(y => y.replace(/%/gu, ''))
      .forEach(z => {
        const y = z.split('\n');
        if (y.length > 2) json[y.shift()] = y;
        else json[y.shift()] = y.shift();
      });
    targetRepo.set(json.NAME, json);
  });
}

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @async
 * @function checkRepo
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @description Used to download and extract repo tarball
 */
export async function checkRepo(tux) {
  const startTS = Date.now();
  const trim = str => (str.length > 2048 ? `${str.slice(0, 2045)}...` : str);
  const channel = await tux.channels.fetch(
    process.env.REPOSITORY_UPDATES_CHANNEL
  );
  const mirrorStatus = new Collection();
  const targetRepository = new Collection();
  /**
   * @author SoulHarsh007 <harsh.peshwani@outlook.com>
   * @description handles failure state for repository mirrors
   * @param {any} data - the error content
   * @param {string | URL} [mirror] - the mirror url
   */
  const onRepoError = (data, mirror) => {
    tux.logger.log(`${data}`, 'ERROR', 'REPO-CHECK');
    if (mirror) {
      mirrorStatus.set(mirror, {
        passed: false,
        info: data,
      });
    }
  };
  const mirrorList = await centra(process.env.MIRROR_LIST_URI)
    .text()
    .catch(e =>
      onRepoError(
        `${e.message} while fetching mirror-list from ${process.env.MIRROR_LIST_URI}`
      )
    );
  const mirrors = mirrorList
    ?.match(/^[^#].*(http)(s)?:\/\/(.)*/gm)
    ?.map(x => x.match(/(http)(s)?:\/\/(.)*/g))
    .flat()
    .filter(x => x !== process.env.SOURCE_REPOSITORY_URI);
  if (!mirrors) {
    onRepoError(
      `No repository mirror data in the mirror-list! Mirror-List url: ${process.env.MIRROR_LIST_URI}`
    );
    return;
  }
  let db;
  for await (const mirror of mirrors) {
    mirrorStatus.set(mirror, {});
    try {
      tux.logger.log(
        `Fetching repo data from mirror: ${mirror}`,
        'INFO',
        'REPO-CHECK'
      );
      rmSync('./repo/db.check.tar', {
        recursive: true,
        force: true,
      });
      rmSync('./repo/db.check.tar.xz', {
        recursive: true,
        force: true,
      });
      db = await centra(`${mirror}Reborn-OS.db.tar.xz`)
        .header(
          'User-Agent',
          'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0'
        )
        .timeout(15000)
        .raw();
      try {
        writeFileSync('./repo/db.check.tar.xz', db);
      } catch (error) {
        tux.logger.log(
          `Failed at storing repo: ${error}`,
          'ERROR',
          'REPO-CHECK'
        );
        onRepoError(error, mirror);
        continue;
      }
      rmSync('./repo/check', {
        recursive: true,
        force: true,
      });
      mkdirSync('./repo/check');
      try {
        execFileSync('bsdtar', [
          '-C',
          './repo/check',
          '-xf',
          './repo/db.check.tar.xz',
        ]);
        tux.logger.log(
          'Extracted repo files successfully',
          'SUCCESS',
          'REPO-CHECK'
        );
      } catch (error) {
        tux.logger.log(
          `Failed at extracting tarball: ${error}`,
          'ERROR',
          'REPO-CHECK'
        );
        onRepoError(error, mirror);
        continue;
      }
      cacheRepo(targetRepository);
      const outDated = [];
      const gracePeriodSync = [];
      tux.rebornRepo.forEach(x => {
        if (targetRepository.has(x.NAME)) {
          const result = targetRepository.get(x.NAME);
          const targetTime = new Date(result.BUILDDATE * 1000).getTime();
          const repoTime = new Date(x.BUILDDATE * 1000).getTime();
          if (targetTime < repoTime) {
            if (targetTime + 2880000 < repoTime) {
              outDated.push({
                ...x,
                outOfSyncSince: prettyMS(repoTime - targetTime, {
                  verbose: true,
                }),
              });
            } else {
              gracePeriodSync.push({
                ...x,
                outOfSyncSince: prettyMS(repoTime - targetTime, {
                  verbose: true,
                }),
              });
            }
          }
        } else {
          outDated.push({
            ...x,
            outOfSyncSince: 'This package is not available in the repository!',
          });
        }
      });
      if (outDated.length) {
        onRepoError(
          trim(
            `${mirror} seems out of sync, Here is the list of packages I found outdated:\n${outDated
              .map(x => `${x.NAME} - ${x.outOfSyncSince}`)
              .join('\n')}`
          ),
          mirror
        );
      } else {
        mirrorStatus.set(mirror, {
          passed: true,
          info: gracePeriodSync.length
            ? `\nPackages in grace period out of sync:\n${gracePeriodSync
                .map(x => `${x.NAME} - ${x.outOfSyncSince}`)
                .join('\n')}`
            : 'Passed the test successfully',
        });
      }
    } catch (error) {
      tux.logger.log(
        `Failed at downloading repo: ${error}\nMirror: ${mirror}`,
        'ERROR',
        'REPO-CHECK'
      );
      onRepoError(error, mirror);
    }
  }
  const paste = await privateBin(
    mirrorStatus
      .map(
        (data, mirror) =>
          `${mirror} - Passed: ${data.passed}, Additional Information: ${data.info}`
      )
      .join('\n'),
    (...args) => tux.logger.log(...args)
  );
  const result = `${mirrorStatus.size} mirrors were tested\n${
    mirrorStatus.filter(x => x.passed).size
  } mirrors passed the test\n${
    mirrorStatus.filter(x => !x.passed).size
  } mirrors failed the test`;
  tux.logger.log(result, 'INFO', 'REPO-CHECK');
  const embed = new MessageEmbed()
    .setDescription(result)
    .setColor('BLUE')
    .setTitle("Tux's Repository Monitoring System")
    .setFooter(
      `Next scheduled check after: ${prettyMS(startTS + 28800000 - Date.now(), {
        verbose: true,
      })}`
    );
  if (paste.error) {
    channel.send(
      `${paste.error.message} while uploading results to privatebin! (${process.env.PRIVATE_BIN_URI})`
    );
    channel.send({
      embed,
    });
  } else {
    channel.send({
      embed: embed
        .setDescription(
          `${result}\nGenerated completion report at: ${paste.url}`
        )
        .setURL(paste.url),
    });
  }
}

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2022
 * @since v1.0.0-Beta
 * @async
 * @function checkPackages
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @description Compares available rebornos packages to AUR
 */
export async function checkPackages(tux) {
  const paste = await privateBin(
    tux.outdated
      .map(
        (v, k) =>
          `${k} seems to be outdated, AUR/${k}: v${v.aurVersion} vs Reborn-OS/${k}: v${v.version}`
      )
      .join('\n'),
    (...args) => tux.logger.log(...args)
  );
  const channel = await tux.channels.fetch(
    process.env.REPOSITORY_UPDATES_CHANNEL
  );
  const result = `Tux thinks there are: ${tux.outdated.size} outdated packages in Reborn-OS repository`;
  const embed = new MessageEmbed()
    .setDescription(result)
    .setColor('BLUE')
    .setTitle("Tux's Repository Monitoring System")
    .setFooter('Next scheduled check: next boot');
  if (paste.error) {
    channel.send(
      `${paste.error.message} while uploading results to privatebin! (${process.env.PRIVATE_BIN_URI})`
    );
    channel.send({
      embed,
    });
  } else {
    channel.send({
      embed: embed
        .setDescription(
          `${result}\nGenerated completion report at: ${paste.url}`
        )
        .setURL(paste.url),
    });
  }
}

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2022
 * @since v1.0.0-Beta
 * @async
 * @function archPackagesMonitor
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @description Used to store latest changes made by ArchLinux team in the packages (eg: add, move, delete)
 */
export async function archPackagesMonitor(tux) {
  const startTS = Date.now();
  const channel = await tux.channels.fetch(
    process.env.ARCH_REPOSITORY_UPDATES_CHANNEL
  );
  const trim = (str, max) =>
    str.length > max ? `${str.slice(0, max - 3)}...` : str;
  const sendToDiscord = data => {
    if (!tux.archCommits.has(data.sha)) {
      tux.archCommits.add(data.sha);
      channel.send({
        embed: new MessageEmbed()
          .setDescription(trim(data.commit.message))
          .setColor('BLUE')
          .setTitle("Tux's Repository Monitoring System")
          .setFooter(
            `Next scheduled check after: ${prettyMS(
              startTS + 900000 - Date.now(),
              {
                verbose: true,
              }
            )}`
          ),
      });
    }
  };
  const packages = await centra(
    'https://api.github.com/repos/archlinux/svntogit-packages/commits'
  )
    .header({
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
    })
    .json();
  const community = await centra(
    'https://api.github.com/repos/archlinux/svntogit-community/commits'
  )
    .header({
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
    })
    .json();
  packages
    .filter(x => x.commit.message.match(/add|db-.{3,6}/gi))
    .filter(x => !x.commit.message.match(/-unstable|\[testing\]/gi))
    .forEach(sendToDiscord);
  community
    .filter(x => x.commit.message.match(/add|db-.{3,6}/gi))
    .filter(x => !x.commit.message.match(/-unstable|\[testing\]/gi))
    .forEach(sendToDiscord);
}
