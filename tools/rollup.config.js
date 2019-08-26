import folder from './cms'

export default {
  input: 'src/i.js',
  output: {
    dir: 'www',
    format: 'iife'
  },
  plugins: [
    folder()
  ]
};