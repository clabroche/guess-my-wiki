const express = require('express');
const Wikipedia = require('../shared/WikipediaBackend');
const router = express.Router();
const parsefilterQuery = require('../middleware/parseFilterQuery');
const authAdmin = require('../middleware/authAdmin');
const auth = require('../middleware/auth');
const searchableFields = parsefilterQuery([
  { field: '_id', type: 'objectId', label: 'ID' },
])


router.get('/find', auth, searchableFields, async function (req, res) {
  const filter = req.filter
  const wiki = await Wikipedia.find(filter)
  wiki
    ? res.json(wiki)
    : res.status(404).send('Game not found')
})
router.get('/', auth, searchableFields, async function (req, res) {
})
router.post('/', authAdmin, searchableFields, async function (req, res) {
})
router.put('/:gameId', authAdmin, searchableFields, async function (req, res) {
})
router.delete('/:gameId', authAdmin, searchableFields, async function (req, res) {
})

module.exports = router