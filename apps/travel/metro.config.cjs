const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

// Expo serves public/ during development and copies it into static web exports.
const { version } = require('maplibre-gl/package.json');
const publicDir = path.join(__dirname, 'public', 'maplibre', version);
fs.mkdirSync(publicDir, { recursive: true });
for (const name of ['maplibre-gl.mjs', 'maplibre-gl-worker.mjs']) {
  fs.copyFileSync(
    require.resolve(`maplibre-gl/dist/${name}`),
    path.join(publicDir, name),
  );
}

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
