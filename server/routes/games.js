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
    req.body.custom = await PromiseB.map(req.body.custom, async link => {
      if(link && link.pageid) return link
      const _link = await wikipediaWrapper.randomPageId()
      return {
        link: _link.title,
        pageid: _link.pageid,
      }
    })
    req.body.wikipediaId = await Wikipedia.insertNewInDB(req.body?.custom)
    if (!req.body.wikipediaId) return res.status(404).send('Page not found')
  }
  const game = new Game({...req.body, ownerId: req.user._id})
  if (!game.wikipediaId) {
    const wiki = await Wikipedia.getByDifficulty(game.difficulty)
    game.wikipediaId = wiki ? wiki._id : null
  }
  game.score = 1000
  await game.loadWikipedia()
  if (game?.wikipedia?.beginPage) {
    game.currentLinks = await wikipediaWrapper.getPageLinks(game?.wikipedia?.beginPage)
  }
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
  game.score = Math.floor(game.score * 0.95)
  if(game.score < 0 ) game.score = 0
  
  const missings = game.wikipedia.steps.filter((step, i, steps) => {
    return i !== 0 &&
      i !== steps.length - 1 &&
      !game.allBonus.includes(step.link)
  })
  const missingslabels = missings.map(a => a.link)
  const indexOfBonusLink = missingslabels.indexOf(link.pageid)
  if(indexOfBonusLink !== -1) {
    game.allBonus.push(link.pageid)
    game.score += 500
  } 
  if (link.pageid === game.wikipedia.endPage || link.pageid === game.wikipedia.endLabel) {
    game.completed = true
  }
  game.currentLinks = await wikipediaWrapper.getPageLinks(link.pageid)
  await game.save()
  res.json(game.currentLinks)
})
router.post('/:gameId/more/', searchableFields, async function (req, res) {
  const link = req.body
  const game = await Game.getById(req.params.gameId)
  await game.loadWikipedia()
  game.score = Math.floor(game.score - 50)
  if (game.score < 0) game.score = 0
  if (link.pageid === game.wikipedia.endPage || link.pageid === game.wikipedia.endLabel) {
    game.completed = true
  }
  game.currentLinks = await wikipediaWrapper.getPageLinks(link.pageid, game.currentLinks.length + 10)
  await game.save()
  res.json(game.currentLinks)
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