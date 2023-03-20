/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @copyright SoulHarsh007 2022
 * @since v1.0.0-Beta
 * @async
 * @function pacmonLoader
 * @param {import('../structures/core/tux.js').HelperTux}  tux - tux, extended discord.js client
 * @description Used to update package monitoring data data
 */
export default async function pacmonLoader(tux) {
  const uSubs = await tux.pacmon.all();
  if (uSubs.length) {
    const pkgInfo = {};
    const packages = [
      ...new Set(uSubs.map(x => x.value.map(y => y.name)).flat()),
    ];
    for (const pkg of packages) {
      const pkgData = await tux.commands.get('pacman -S').getPinfo(pkg);
      if (pkgData.results.length) {
        pkgInfo[pkg] = pkgData.results[0];
      } else {
        pkgInfo[pkg] = {
          epoch: 'PACKAGE-',
          pkgver: 'NOT-FOUND-IN',
          pkgrel: 'ARCH-REPO',
        };
      }
    }
    for (const uSub of uSubs) {
      let user;
      try {
        user = await tux.users.fetch(uSub.id);
      } catch (error) {
        tux.logger.log(error, 'Error', 'Pacmon-Loader');
      }
      if (user) {
        let str = '';
        let hasChange = false;
        const newData = [];
        uSub.value
          .filter(x => pkgInfo[x.name])
          .forEach(x => {
            const epoch = pkgInfo[x.name].epoch
              ? `${pkgInfo[x.name].epoch}:`
              : '';
            const version = `${epoch}${pkgInfo[x.name].pkgver}-${
              pkgInfo[x.name].pkgrel
            }`;
            if (x.version !== version) {
              str += `${x.name} - ${x.version} => ${version}\n`;
              hasChange = true;
              newData.push({
                name: x.name,
                version,
              });
            } else {
              newData.push({
                name: x.name,
                version,
              });
            }
          });
        await tux.pacmon.set(uSub.id, newData);
        const channel = await tux.channels.fetch(
          process.env.ARCH_REPOSITORY_UPDATES_CHANNEL
        );
        await channel.send(
          `Hey ${user.tag},\n\nThe following packages have been updated:\n\n${
            str ? str : '[No Package Update Detected]'
          }`,
          {
            split: true,
            code: 'css',
            reply: hasChange ? user : undefined,
          }
        );
      }
    }
  }
}
