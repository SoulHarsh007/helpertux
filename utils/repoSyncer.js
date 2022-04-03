import {centra} from '@nia3208/centra';
import {path7za} from '7zip-bin';
import {execSync} from 'child_process';
import {writeFileSync, readdirSync, readFileSync, rmSync, mkdirSync} from 'fs';

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
  const mirrors = readFileSync('./repo/reborn-mirrorlist')
    .toString()
    .match(/(http)(s)?:\/\/(.)*/g);
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
  try {
    writeFileSync('./repo/db.tar.xz', db);
  } catch (error) {
    tux.logger.log(`Failed at storing repo: ${error}`, 'ERROR', 'REPO-SYNC');
  }
  rmSync('./repo/extracted', {
    recursive: true,
    force: true,
  });
  mkdirSync('./repo/extracted');
  try {
    execSync(`${path7za} x ./repo/db.tar.xz -y -o./repo/`);
    execSync(`${path7za} x ./repo/db.tar -y -o./repo/extracted/`);
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
      .map(z => {
        const y = z.split('\n');
        if (y.length > 2) {
          json[y.shift()] = y;
        } else {
          json[y.shift()] = y[0];
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
            json.VERSION !== json.AUR_VERSION.replace(/\d:/g, '')
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
  mkdirSync('./tldr/extracted');
  try {
    execSync(`${path7za} x ./tldr/data.zip -y -o./tldr/extracted/`);
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
