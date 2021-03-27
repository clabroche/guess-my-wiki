const express = require('express');
const Game = require('../shared/GameBackend');
const router = express.Router();
const parsefilterQuery = require('../middleware/parseFilterQuery');
const auth = require('../middleware/auth');
const Wikipedia = require('../shared/WikipediaBackend');
const wikipediaWrapper = require('../helpers/wikipediaWrapper');
const searchableFields = parsefilterQuery([
  {field: '_id', type: 'objectId', label: 'ID'},
])

router.use(auth)

router.get('/find', searchableFields, async function (req, res) {
  const filter = req.filter
  const game = await Game.find(filter, req.user._id)
  await game.loadWikipedia()
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.post('/', async function (req, res) {
  const difficulty = req.body?.difficulty
  if (difficulty === 'custom') {
    req.body.wikipediaId = await wikipediaWrapper.insertNewInDB(req.body?.custom)
    if (!req.body.wikipediaId) return res.status(404).send('Page not found')
  }
  const game = new Game({...req.body, ownerId: req.user._id})
  if (!game.wikipediaId) {
    const wiki = await Wikipedia.getByDifficulty(game.difficulty)
    game.wikipediaId = wiki ? wiki._id : null
  }
  await game.save()
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.put('/:gameId', async function (req, res) {
  const game = await Game.update(req.body)
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.delete('/:gameId', async function (req, res) {
  await Game.delete(req.params.gameId)
  res.send('ok')
})

module.exports = router