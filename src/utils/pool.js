/**
 * Apply callback to each pool element
 *
 * @param {any[]} pools
 * @param {{ (member: any): void; }} [callback]
 * @param {{ property: any; value: any; }} [options]
 */
export function tour(pools, callback, options) {
  for (const pool of pools) {
    const members = options
      ? pool.getMatching(options.property, options.value)
      : pool.getChildren();

    for (let i = members.length - 1; i > -1; i--) {
      const member = members[i];
      callback(member);
    }
  }
}
