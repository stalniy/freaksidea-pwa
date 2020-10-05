import sharp from 'sharp';
import fs from 'fs';

const resizeCache = new Map();
async function resizeImage({ path, dest, width }, options) {
  if (path.endsWith('.gif') || resizeCache.has(path)) {
    // gif requires additional system libraries
    return Promise.resolve();
  }

  const resultingFile = `${options.dir}${dest}`;

  if (!fs.existsSync(resultingFile)) {
    await sharp(path)
      .resize(width)
      .toFile(resultingFile);
  }

  resizeCache.set(path, true);
}

export default (markdown) => ({
  async renderStart(options) {
    await markdown.processPostParsingTasks({
      resizeImage
    }, { dir: options.dir });
  }
})
