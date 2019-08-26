export default function cms() {
  return {
    name: 'cms',

    resolveId(id) {
      if (id === 'articles.mapping') {
        return `${id}.js`
      }
    },

    load(id) {
      if (id === 'articles.mapping.js') {
        const refUk = this.emitFile({
          type: 'asset',
          fileName: 'articles.all.uk.json',
          source: Buffer.from('freaksidea.com')
        })

        const refEn = this.emitFile({
          type: 'asset',
          fileName: 'articles.all.en.json',
          source: Buffer.from('freaksidea.com')
        })

        return `export default {
          all: {
            uk: import.meta.ROLLUP_ASSET_URL_${refUk},
            en: import.meta.ROLLUP_ASSET_URL_${refEn}
          }
        }`
      }
    }
  }
}