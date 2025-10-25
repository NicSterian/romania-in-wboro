import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const sourcePath = resolve('src/assets/logo.jpg');
const publicDir = resolve('public');

const targets = [
  { size: 16, name: 'favicon-16.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'favicon-192.png' },
];

async function ensureDir(filePath) {
  await fs.mkdir(dirname(filePath), { recursive: true });
}

async function generate() {
  await ensureDir(publicDir);

  for (const target of targets) {
    const outputPath = resolve(publicDir, target.name);
    await sharp(sourcePath)
      .resize(target.size, target.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(outputPath);
  }

  const icoBuffer = await sharp(sourcePath)
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFormat('ico', { sizes: [16, 32] })
    .toBuffer();

  await fs.writeFile(resolve(publicDir, 'favicon.ico'), icoBuffer);

  console.log('Favicons generated successfully.');
}

generate().catch((error) => {
  console.error('Failed to generate favicons:', error);
  process.exitCode = 1;
});
