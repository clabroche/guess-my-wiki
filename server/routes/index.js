var express = require('express');
var router = express.Router();

router.use('/games', require('./games'))
router.use('/user', require('./users'));
router.use('/version', require('./version'))

module.exports = router;
