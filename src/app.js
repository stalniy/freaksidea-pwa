import 'setimmediate';
import * as components from './components/*.js'; // eslint-disable-line
import i18n from './services/i18n';

async function main() {
  const messages = await import('./lang/ru.yml');

  i18n.locale('ru');
  i18n.replace(messages.default);
  Object.values(components)
    .forEach(c => customElements.define(c.cName, c));
}

main();
