import 'setimmediate';
import * as components from './components/*.js'; // eslint-disable-line
import i18n from './services/i18n';

async function main() {
  await i18n.load('ru');
  Object.values(components)
    .forEach(c => customElements.define(c.cName, c));
}

main();
