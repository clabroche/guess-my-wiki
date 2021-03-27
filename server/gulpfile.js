const {series, watch, parallel} = require('gulp')
const spawn = require('child_process').spawn
let node

function server(done) {
  if(node){
    console.log('kill')
    node.kill('SIGTERM')
  }
  setTimeout(() => {
    node = spawn('node', ['./bin/www'], {stdio: 'inherit'})
    done()
  }, 1000);
}

function watchFiles() {
  watch(['./**/*.js', '!./services/chrome/***'], server)
}

const reload = parallel(watchFiles, server)
exports.default = series(reload)