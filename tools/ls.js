import fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

export default async function walk(path, callback) {
  const files = await readdir(path, { encoding: 'utf8', withFileTypes: true });
  const promises = files.map(async (file) => {
    if (file.isDirectory()) {
      await walk(`${path}/${file.name}`, callback);
    } else {
      await callback({
        path: `${path}/${file.name}`,
        name: file.name
      });
    }
  });

  await Promise.all(promises);
}
