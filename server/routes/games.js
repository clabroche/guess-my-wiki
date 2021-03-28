const express = require('express');
const Game = require('../shared/GameBackend');
const router = express.Router();
const parsefilterQuery = require('../middleware/parseFilterQuery');
const auth = require('../middleware/auth');
const Wikipedia = require('../shared/WikipediaBackend');
const wikipediaWrapper = require('../helpers/wikipediaWrapper');
const PromiseB = require('bluebird');
const searchableFields = parsefilterQuery([
  { field: '_id', type: 'objectId', label: 'ID' },
  { field: 'completed', type: 'boolean', label: 'Complété' },
])

router.use(auth)

router.get('/find', searchableFields, async function (req, res) {
  const filter = req.filter
  const game = await Game.find(filter, req.user._id)
  if (game) {
    await game.loadWikipedia()
  }
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.get('/', searchableFields, async function (req, res) {
  const filter = req.filter
  const games = await Game.all(filter, req.user._id)
  res.json(await PromiseB.map(games, async game => {
    await game.loadWikipedia()
    return game
  }).filter(game => game.wikipedia != null))
})
router.get('/:gameId/current-step', searchableFields, async function (req, res) {
  const game = await Game.getById(req.params.gameId)
  const links = await game.getLinks()
  res.json(links) 
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
  game.score = 1000
  await game.save()
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.post('/:gameId/next/', searchableFields, async function (req, res) {
  const link = req.body
  const game = await Game.getById(req.params.gameId)
  await game.loadWikipedia()
  game.steps.push(link)
  game.score = Math.floor(game.score * 0.9)
  if(link.pageid === game.wikipedia.endPage) {
    game.completed = true
  }
  await game.save()
  res.json(await wikipediaWrapper.getPageLinks(link.pageid))
})
router.put('/:gameId', async function (req, res) {
  const game = await Game.update(req.body)
  game
    ? res.json(game)
    : res.status(404).send('Game not found')
})
router.delete('/:gameId', async function (req, res) {
  await Game.delete(req.params.gameId, req.user._id)
  res.send('ok')
})

module.exports = router