import { expect, test } from '@playwright/test';

test.use({
  launchOptions: { args: ['--enable-unsafe-swiftshader'] },
});

test('Explore draws a geographic feature on a phone-sized map', async ({
  page,
}) => {
  const diagnostics: string[] = [];
  page.on('console', (message) => diagnostics.push(message.text()));
  page.on('pageerror', (error) => diagnostics.push(error.message));
  page.on('requestfailed', (request) => diagnostics.push(request.url()));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://tiles.openfreemap.org/styles/**', (route) =>
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: {
        version: 8,
        sources: {
          cebu: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [123.900296875, 10.3318875],
              },
            },
          },
        },
        layers: [
          {
            id: 'land',
            type: 'background',
            paint: { 'background-color': '#fff' },
          },
          {
            id: 'venue',
            type: 'circle',
            source: 'cebu',
            paint: { 'circle-radius': 64, 'circle-color': '#ff00ff' },
          },
        ],
      },
    }),
  );
  await page.goto('http://127.0.0.1:3003');
  const canvas = page.locator('.maplibregl-canvas');
  await expect(canvas).toBeVisible();
  // A visible canvas can still be blank if its worker never processes data.
  await expect
    .poll(async () => {
      const png = await canvas.screenshot();
      const painted = await page.evaluate(async (base64) => {
        const image = new Image();
        image.src = 'data:image/png;base64,' + base64;
        await image.decode();
        const sample = document.createElement('canvas');
        sample.width = image.width;
        sample.height = image.height;
        const ctx = sample.getContext('2d');
        if (ctx === null) {
          return false;
        }
        ctx.drawImage(image, 0, 0);
        const { data } = ctx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 255) {
            return true;
          }
        }
        return false;
      }, png.toString('base64'));
      return painted ? 'painted' : diagnostics.join('\n');
    })
    .toBe('painted');
});
