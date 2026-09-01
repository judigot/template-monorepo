export default {
  '*.{ts,tsx,js,jsx,json,css,md}':
    'biome check --write --no-errors-on-unmatched',
  '*.{ts,tsx}': 'oxlint --config .oxlintrc.json --fix',
};
