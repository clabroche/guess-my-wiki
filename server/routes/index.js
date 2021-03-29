var express = require('express');
var router = express.Router();

router.use('/games', require('./games'))
router.use('/user', require('./users'));
router.use('/version', require('./version'))
router.use('/wikipedias', require('./wikipedia'));

module.exports = router;
