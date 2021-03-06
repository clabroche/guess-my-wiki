let BASE 
BASE = "guessMyWiki"

const stack = [
  {
    label: 'guessMyWiki-server',
    spawnCmd: 'npm',
    spawnArgs: ['run', 'server'],
    spawnOptions: {
      cwd:  __dirname,
      env: Object.assign({
        PORT: '4215',
        mongoDbURL:`mongodb://root:123456@localhost:27017/${BASE}?authSource=admin`
      }, process.env)
    }
  },
  {
    label: 'guessMyWiki-front',
    spawnCmd: 'npm',
    spawnArgs: ['run', 'client'],
    spawnOptions: {
      cwd: __dirname,
      env: Object.assign({
        VUE_APP_SERVER_URL: 'http://localhost',
        VUE_APP_SERVER_PORT: 4215,
        VUE_APP_VERSION: 'v0.0.0'
      }, process.env)
    }
  },
  {
    label: 'guessMyWiki-front-cordova',
    spawnCmd: 'npm',
    spawnArgs: ['run', 'capacitor:serve -- --android'],
    spawnOptions: {
      cwd: __dirname,
      env: Object.assign({
        VUE_APP_SERVER_URL: 'http://localhost',
        VUE_APP_SERVER_PORT: 4215,
      }, process.env)
    }
  }
]




require('dns').lookup(require('os').hostname(), function (err, add) {
  stack.filter(({label}) => label.includes('front-cordova')).pop().spawnOptions.env.VUE_APP_SERVER_URL = `http://${add}`
})


module.exports = stack
