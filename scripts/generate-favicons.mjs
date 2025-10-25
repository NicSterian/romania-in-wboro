import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const sourcePath = resolve('src/assets/logo.jpg');
const publicDir = resolve('public');

const targets = [
  { size: 16, name: 'favicon-16.png', includeInIco: true },
  { size: 32, name: 'favicon-32.png', includeInIco: true },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'favicon-192.png' },
];

async function ensureDir(filePath) {
  await fs.mkdir(dirname(filePath), { recursive: true });
}

function createIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + 16 * count;

  for (const image of images) {
    const entry = Buffer.alloc(16);
    const sizeByte = image.size >= 256 ? 0 : image.size;

    entry.writeUInt8(sizeByte, 0);
    entry.writeUInt8(sizeByte, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);

    entries.push(entry);
    offset += image.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((image) => image.buffer)]);
}

async function generate() {
  await ensureDir(publicDir);

  const icoImages = [];

  for (const target of targets) {
    const outputPath = resolve(publicDir, target.name);
    const pipeline = sharp(sourcePath)
      .resize(target.size, target.size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png();

    if (target.includeInIco) {
      const buffer = await pipeline.clone().toBuffer();
      icoImages.push({ size: target.size, buffer });
    }

    await pipeline.toFile(outputPath);
  }

  if (!icoImages.length) {
    throw new Error('ICO generation requires at least one image size.');
  }

  const icoBuffer = createIco(icoImages);

  await fs.writeFile(resolve(publicDir, 'favicon.ico'), icoBuffer);

  console.log('Favicons generated successfully.');
}

generate().catch((error) => {
  console.error('Failed to generate favicons:', error);
  process.exitCode = 1;
});
