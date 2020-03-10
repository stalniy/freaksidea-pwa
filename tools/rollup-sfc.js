import SAXParser from 'parse5-sax-parser';
import MagicString from 'magic-string';
import { basename } from 'path';



function dasherize(name) {
  return name[0].toLowerCase() + name.slice(1)
    .replace(/([A-Z])/g, letter => `-${letter.toLowerCase()}`)
}

function parseComponent(code) {
  const parser = new SAXParser({ sourceCodeLocationInfo: true });
  const tokens = {
    template: { depth: 0 },
    script: { depth: 0 },
    style: {
      depth: 0,
      items: []
    }
  };

  parser.on('startTag', (token) => {
    if (!(token.tagName in tokens) || tokens.template.depth || tokens.script.depth) {
      return;
    }

    const details = tokens[token.tagName];

    details.depth++;

    if (details.items) {
      details.items.push({
        start: token.sourceCodeLocation,
        end: null
      })
    } else {
      details.start = token.sourceCodeLocation
    }
  });
  parser.on('endTag', (token) => {
    if (!(token.tagName in tokens) || !tokens[token.tagName].depth) {
      return;
    }

    const details = tokens[token.tagName];

    details.depth--;

    if (details.items) {
      details.items[details.items.length - 1].end = token.sourceCodeLocation;
    } else {
      details.end = token.sourceCodeLocation
    }
  });
  parser.write(code, 'utf8', console.log);
  parser.stop();

  return tokens;
}

export default function sfc(options = {}) {
  const chunks = new Map();

  return {
    name: 'sfc',
    transform(srcCode, filepath) {
      if (!filepath.endsWith(options.ext)) {
        return null
      }

      const code = new MagicString(srcCode);
      const tokens = parseComponent(srcCode);

      [tokens.template, tokens.script, ...tokens.style.items].forEach((token) => {
        if (token) {
          code.remove(token.start.startOffset, token.start.endOffset);
          code.remove(token.end.startOffset, token.end.endOffset);
        }
      });

      const className = basename(filepath, options.ext);


      code.appendLeft(tokens.script.end.startOffset - 2, `
        render() {
          return html\`
      `);
      code.move(
        tokens.template.start.endOffset,
        tokens.template.end.startOffset,
        tokens.script.end.startOffset - 2
      )
      code.overwrite(tokens.script.end.startOffset - 2, tokens.script.end.startOffset, `
          \`
        }
      }
      `);

      // const script = parts.script.innerHTML.trim();
      // const template = parts.template.innerHTML.trim();
      // const targetName = detectTarget(script, filepath);
      // const styleImports = [];
      // const styleVars = [];

      // chunks.set(`${filepath}.chunk.html`, template);
      // chunks.set(`${filepath}.chunk.js`, script);
      // parts.style.forEach((style, index) => {
      //   const stylesPath = `${filepath}.${index}.css`;
      //   const varName = `_s${index}`;

      //   chunks.set(stylesPath, style.innerHTML.trim())
      //   styleImports.push(`import ${varName} from '${stylesPath}'`);
      //   styleVars.push(varName);
      // });

      return {
        moduleSideEffects: false,
        map: null,
        code: ''
        // code: `
        //   import Component from '${filepath}.chunk.js';
        //   import template from '${filepath}.chunk.html';
        //   ${styleImports.join(';\n')};

        //   Object.defineProperty(Component, 'cName', { value: '${dasherize(targetName)}' });
        //   ${styleVars.length
        //     ? `Object.defineProperty(Component, 'styles', { value: ${JSON.stringify(styleVars)} })`
        //     : ''
        //   }

        //   export default Component;
        // `.trim()
      }
    }
  }
}
