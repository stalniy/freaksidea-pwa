import updateBrowser from 'browser-update';
import bootstrap from './app';
import { register } from './serviceWorker';

updateBrowser({
  required: {
    e: -4,
    f: -3,
    o: -3,
    s: -1,
    c: -3
  },
  insecure: true
});

window.__isAppExecuted__ = true;
const app = bootstrap('fi-app');
register({
  onUpdate(worker) {
    app.notify('updateAvailable', {
      onClick() {
        worker.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
});
