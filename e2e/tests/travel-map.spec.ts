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
  await page.route('https://tiles.openfreemap.org/styles/**', (route) => {
    diagnostics.push(route.request().url());
    return route.fulfill({
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
    });
  });
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
          return 'no canvas context';
        }
        ctx.drawImage(image, 0, 0);
        const { data } = ctx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < data.length; i += 4) {
          if (
            (data[i] ?? 0) > 220 &&
            (data[i + 1] ?? 255) < 30 &&
            (data[i + 2] ?? 0) > 220
          ) {
            return 'painted';
          }
        }
        const colors = new Set<number>();
        for (let i = 0; i < data.length; i += 40) {
          colors.add(((data[i] ?? 0) << 16) + ((data[i + 1] ?? 0) << 8) + (data[i + 2] ?? 0));
        }
        const canvas = document.querySelector('.maplibregl-canvas');
        const rect = canvas?.getBoundingClientRect();
        const covering = rect ? document.elementsFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2).slice(0, 6).map((el) => el.tagName + '.' + el.className).join(' ') : '';
        return JSON.stringify({ width: image.width, height: image.height, colors: [...colors].slice(0, 20), covering });
      }, png.toString('base64'));
      return painted === 'painted' ? painted : [painted, ...diagnostics].join('\n');
    })
    .toBe('painted');
});
