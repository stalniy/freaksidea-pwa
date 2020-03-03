import Polyglot from 'node-polyglot';

function createFormatter(Type) {
  const cache = {};
  return (locale, formatType, actualFormat) => {
    const key = `${locale}.${formatType}`;

    if (!cache[key]) {
      cache[key] = new Type(locale, actualFormat);
    }

    return cache[key];
  }
}

const dateTime = createFormatter(Intl.DateTimeFormat);

class I18n extends Polyglot {
  constructor(...args) {
    super(...args);
    this._dateTimeFormats = {};
  }

  extend(phrases, prefix = '') {
    if (phrases.dateTimeFormats) {
      this._dateTimeFormats = phrases.dateTimeFormats;
    }

    return super.extend(phrases, prefix);
  }

  d(date, format = 'default') {
    const actualFormat = this._dateTimeFormats[format];
    const actualDate = typeof date === 'string' ? new Date(date) : date;

    return dateTime(this.locale(), format, actualFormat).format(actualDate);
  }
}

const i18n = new I18n({});

export default i18n;

export function interpolate(string, vars) {
  return Polyglot.transformPhrase(string, vars, i18n.locale());
}
