const { basename, dirname, extname } = require('path');
const getImageSize = require('image-size');

function replaceLocalSrcWithUrl(src, options) {
  const root = options.srcRoot || '/images';
  return `${root}/${basename(src)}`;
}

const SIZES = {
  xs: 375,
  sm: 768,
  md: 1024,
};

function makeResponsive(token, sizeNames, { path, src, md }) {
  const srcset = [];
  const sizes = [];
  const ext = extname(src);
  const filename = src.slice(0, -ext.length);
  const widthIndex = token.attrIndex('width');
  const width = widthIndex === -1 ? Number.MAX_VALUE : token.attrs[widthIndex][1];

  sizeNames.forEach((name) => {
    const size = SIZES[name];

    if (width < size) {
      return;
    }

    const sizedName = `${filename}-${name}${ext}`;
    srcset.push(`${sizedName} ${size}w`);
    sizes.push(`(max-width: ${size}px) ${size}px`);
    md.addPostParsingTask({
      type: 'resizeImage',
      path,
      dest: sizedName,
      width: size
    });
  });

  if (srcset.length) {
    srcset.push(`${src} 1280w`);
    sizes.push(`1280px`);
    token.attrSet('srcset', srcset.join(','));
    token.attrSet('sizes', sizes.join(','));
  }
}

module.exports = function image(md, options = {}) {
  const normalizeSrc = options.normalizeSrc || replaceLocalSrcWithUrl;
  const renderImage = md.renderer.rules.image;

  md.renderer.rules.image = (tokens, idx, params, env, self) => {
    const token = tokens[idx];
    const srcIndex = token.attrIndex('src');
    const srcAttr = token.attrs[srcIndex];

    token.attrSet('loading', 'lazy');

    if (srcAttr && srcAttr[1][0] === '.') {
      const imagePath = `${dirname(env.file.path)}/${srcAttr[1]}`;

      if (options.size === 'auto' && env.file) {
        const size = getImageSize(imagePath);

        token.attrSet('width', size.width);
        token.attrSet('style', `max-height: ${size.height}px;`);
      }

      srcAttr[1] = normalizeSrc(srcAttr[1], options);

      if (options.responsive) {
        const src = srcAttr[1];
        const responsiveOptions = options.responsive.find(([pattern]) => pattern.test(src));

        if (responsiveOptions) {
          makeResponsive(token, responsiveOptions[1], {
            src,
            path: imagePath,
            md
          });
        }
      }
    }

    return renderImage(tokens, idx, params, env, self);
  };
};
