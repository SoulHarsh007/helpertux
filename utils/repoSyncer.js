import {centra} from '@nia3208/centra';
import {execFileSync} from 'child_process';
import compare from 'dpkg-compare-versions';
import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'fs';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @async
 * @function fetchRepo
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @description Used to download and extract repo tarball
 */
export async function fetchRepo(tux) {
  const mirrors = await centra(process.env.MIRROR_LIST_URI)
    .text()
    .then(x => x.match(/(http)(s)?:\/\/(.)*/g))
    .catch(err => {
      console.error(err);
      return [process.env.SOURCE_REPOSITORY_URI];
    });
  let db;
  for await (const mirror of mirrors) {
    try {
      tux.logger.log(
        `Fetching repo data from mirror: ${mirror}`,
        'INFO',
        'REPO-SYNC'
      );
      db = await centra(`${mirror}Reborn-OS.db.tar.xz`).raw();
      break;
    } catch (error) {
      tux.logger.log(
        `Failed at downloading repo: ${error}\nMirror: ${mirror}`,
        'ERROR',
        'REPO-SYNC'
      );
    }
  }
  let i = 0;
  while (!db || i !== mirrors.length) {
    try {
      tux.logger.log(
        `Fetching repo data from mirror: ${mirrors[i]}`,
        'INFO',
        'REPO-SYNC'
      );
      db = await centra(`${mirrors[i]}Reborn-OS.db.tar.xz`).raw();
      break;
    } catch (error) {
      tux.logger.log(
        `Failed at downloading repo: ${error}\nMirror: ${mirrors[i]}`,
        'ERROR',
        'REPO-SYNC'
      );
    }
    i++;
  }
  try {
    writeFileSync('./repo/db.tar.xz', db);
  } catch (error) {
    tux.logger.log(`Failed at storing repo: ${error}`, 'ERROR', 'REPO-SYNC');
  }
  rmSync('./repo/extracted', {
    recursive: true,
    force: true,
  });
  mkdirSync('./repo/extracted', {
    recursive: true,
  });
  try {
    execFileSync('bsdtar', [
      '-C',
      './repo/extracted/',
      '-xf',
      './repo/db.tar.xz',
    ]);
  } catch (error) {
    tux.logger.log(
      `Failed at extracting tarball: ${error}`,
      'ERROR',
      'REPO-SYNC'
    );
  }
  tux.logger.log('Extracted repo files successfully', 'SUCCESS', 'REPO-SYNC');
}

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com
 * @copyright SoulHarsh007 2021
 * @function compareVersions
 * @param {string} v1 - version 1
 * @param {string} v2 - version 2
 * @description used to compare versions
 * @returns {boolean} true if v2 is greater than v1
 */
export function isOutdatedVersion(v1, v2) {
  try {
    return compare(v1, v2) < 0;
  } catch (err) {
    return v1 !== v2;
  }
}

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @function cacheRepo
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @description used to cache fetched repo files
 */
export function cacheRepo(tux) {
  readdirSync('./repo/extracted').forEach(x => {
    const json = {};
    readFileSync(`./repo/extracted/${x}/desc`, 'utf-8')
      .trim()
      .split('\n\n')
      .map(y => y.replace(/%/gu, ''))
      .forEach(z => {
        const y = z.split('\n');
        if (y.length > 2) {
          json[y.shift()] = y;
        } else {
          json[y.shift()] = y.shift();
        }
      });
    try {
      tux.commands
        .get('aur -S')
        .getPinfo(json.NAME)
        .then(y => {
          json.AUR_VERSION = y.results[0]?.Version || '';
          tux.rebornRepo.set(json.NAME, json);
          if (
            json.AUR_VERSION &&
            isOutdatedVersion(
              isNaN(json.VERSION[0]) ? json.VERSION.slice(1) : json.VERSION,
              isNaN(json.AUR_VERSION[0])
                ? json.AUR_VERSION.slice(1)
                : json.AUR_VERSION
            )
          ) {
            tux.outdated.set(json.NAME, {
              version: json.VERSION,
              aurVersion: json.AUR_VERSION,
            });
          }
        });
    } catch (error) {
      tux.rebornRepo.set(json.NAME, json);
    }
  });
}

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @async
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @function fetchTLDR
 * @description Used to download and extract TLDR zip
 */
export async function fetchTLDR(tux) {
  let data;
  try {
    tux.logger.log('Fetching tldr data', 'INFO', 'TLDR-SYNC');
    data = await centra(
      'https://raw.githubusercontent.com/tldr-pages/tldr-pages.github.io/master/assets/tldr.zip'
    ).raw();
  } catch (error) {
    tux.logger.log(
      `Failed to download tldr zip: ${error}`,
      'ERROR',
      'TLDR-SYNC'
    );
  }
  writeFileSync('./tldr/data.zip', data);
  rmSync('./tldr/extracted', {
    recursive: true,
    force: true,
  });
  mkdirSync('./tldr/extracted', {
    recursive: true,
  });
  try {
    execFileSync('bsdtar', [
      '-C',
      './tldr/extracted/',
      '-xf',
      './tldr/data.zip',
    ]);
  } catch (error) {
    tux.logger.log(
      `Failed to extract tldr zip: ${error}`,
      'ERROR',
      'TLDR-SYNC'
    );
  }
  tux.logger.log('Extracted tldr files successfully', 'SUCCESS', 'TLDR-SYNC');
}

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @function cacheTLDR
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @description Used to cache TLDR data
 */
export function cacheTLDR(tux) {
  JSON.parse(
    readFileSync('./tldr/extracted/index.json', {
      encoding: 'utf8',
    })
  ).commands.forEach(x => tux.tldr.set(x.name, x));
}

// Version Regex: /(-|-v|-r|_)([0-9]*(\W|_))+[\s\S]*/gi
