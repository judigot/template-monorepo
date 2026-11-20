const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

// Expo serves public/ during development and copies it into static web exports.
const worker = require.resolve('maplibre-gl/dist/maplibre-gl-worker.mjs');
const publicDir = path.join(__dirname, 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(worker, path.join(publicDir, path.basename(worker)));

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
