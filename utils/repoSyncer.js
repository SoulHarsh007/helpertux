import {centra} from '@nia3208/centra';
import {execSync} from 'child_process';
import {
  writeFileSync,
  readdirSync,
  readFileSync,
  existsSync,
  mkdirSync,
} from 'fs';

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @async
 * @function fetchRepo
 * @description Used to download and extract repo tarball
 */
export async function fetchRepo() {
  const db = await centra(
    'https://repo.rebornos.org/RebornOS/Reborn-OS.db.tar.xz'
  )
    .raw()
    .catch(x => console.log(`Failed at downloading repo: ${x}`));
  try {
    writeFileSync('./repo/db.tar.xz', db);
  } catch (error) {
    console.log(`Failed at storing repo: ${error}`);
  }
  if (!existsSync('./repo/extracted')) mkdirSync('./repo/extracted');
  try {
    execSync('tar -C ./repo/extracted/ -xvf ./repo/db.tar.xz');
  } catch (error) {
    console.log(`Failed at extracting repo: ${error}`);
  }
}

/**
 * @author SoulHarsh007 <harshtheking@hotmail.com>
 * @copyright SoulHarsh007 2021
 * @since v1.0.0-Beta
 * @async
 * @function cacheRepo
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @description used to cache fetched repo files
 */
export function cacheRepo(tux) {
  const descs = [];
  readdirSync('./repo/extracted').forEach(x =>
    descs.push(readFileSync(`./repo/extracted/${x}/desc`, 'utf-8'))
  );
  descs.forEach(pkg => {
    const json = {};
    pkg
      .trim()
      .split('\n\n')
      .map(x => x.replace(/%/gu, ''))
      .map(x => {
        const y = x.split('\n');
        if (y.length > 2) json[y.shift()] = y;
        else json[y.shift()] = y[0];
      });
    tux.rebornRepo.set(json.NAME, json);
  });
}

// Version Regex: /(-|-v|-r|_)([0-9]*(\W|_))+[\s\S]*/gi
