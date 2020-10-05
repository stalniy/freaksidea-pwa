const sharp = require('sharp')
const { basename, extname, dirname } = require('path');

function resize(path, width) {
  const dir = dirname(path);
  const ext = extname(path);
  return sharp(path)
    .resize(width)
    .toFile(`${dir}/${basename(path, ext)}-${width}w${ext}`);
}

async function main([path]) {
  console.log(path)
  return Promise.all([
    resize(path, 375),
    resize(path, 768),
    resize(path, 1024)
  ]);
}

main(process.argv.slice(2)).catch(console.error);
