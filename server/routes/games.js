const express = require('express');
const Game = require('../shared/GameBackend');
const router = express.Router();
const parsefilterQuery = require('../middleware/parseFilterQuery');
const auth = require('../middleware/auth');
const searchableFields = parsefilterQuery([
  {field: '_id', type: 'objectId', label: 'ID'},
])

router.use(auth)

router.get('/find', searchableFields, async function (req, res) {
  const filter = req.filter
  const game = await Game.find(filter, req.user._id)
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.post('/', searchableFields, async function (req, res) {
  const game = new Game({...req.body, ownerId: req.user._id})
  await game.save()
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.put('/:gameId', searchableFields, async function (req, res) {
  const game = await Game.update(req.body, req.user._id)
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.delete('/:gameId', searchableFields, async function (req, res) {
  const game = await Game.update(req.body, req.user._id)
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})

module.exports = router