const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/*
 * Expo SDK 58 resolves dependencies outside the watched roots on demand.
 * Watching the whole Bun workspace would recurse into node_modules/.bun,
 * exhausting Android's inotify watch quota inside unprivileged Termux PRoot.
 *
 * Keep app sources (projectRoot) and the one live shared source workspace
 * watched, without hiding dependencies from Metro's resolver via blockList.
 */
config.watchFolders = [path.resolve(__dirname, '../../packages/design-tokens')];

module.exports = config;
