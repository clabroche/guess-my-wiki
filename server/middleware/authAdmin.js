const auth = require('./auth')
module.exports = async function(req, res, next) {
  auth(req, res, (err) => {
    if(err) return next(err)
    if(!req?.user?.admin) return next(Error('Not an admin'))
    next()
  })
  next()
}