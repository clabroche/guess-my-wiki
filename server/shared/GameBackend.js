const { mongo } = require("../helpers/mongoConnect")
const wikipediaWrapper = require("../helpers/wikipediaWrapper")
const Game = require("./Game")
const WikipediaBackend = require("./WikipediaBackend")

class GameBackend extends Game{
  /** @param {GameBackend | {[key: string]: any}} game */
  constructor(game) {
    super(game)
    this._id = this._id ? mongo.getID(this._id) : null
    this.ownerId = this.ownerId ? mongo.getID(this.ownerId) : null
    this.wikipediaId = game.wikipediaId ? mongo.getID(this.wikipediaId) : null
  }
  async save() {
    let newGame
    if (this._id) {
      newGame = await GameBackend.update(this)
    } else {
      newGame = await GameBackend.create(this, this.ownerId)
    }
    return this.merge(newGame)
  }
  /**
   * @param {import('mongodb').ObjectID | string} gameId
   * @param {import('mongodb').ObjectID | string} ownerId
   */
  static async checkGameExists(gameId, ownerId) {
    if(!ownerId) throw new Error('OwnerId is not provided')
    const _game = await GameBackend.getById(gameId, ownerId)
    if (!_game) throw new Error('Game not exists for this user')
  }

  /**
   * @param {Game | {[key: string]: any}} game
   * @param {import('mongodb').ObjectID | string} ownerId
   * @return {Promise<Game>}
   */
  static async create(game, ownerId) {
    const newGame = new GameBackend(game)
    delete newGame._id
    delete newGame.wikipedia
    if(ownerId) newGame.ownerId = mongo.getID(ownerId)
    else throw new Error('OwnerId is not provided')
    const {insertedId} = await mongo.collection('games').insertOne(newGame)
    newGame._id = insertedId
    return newGame ? new GameBackend(newGame) : null
  }

  /**
   * @param {GameBackend | {[key: string]: any}} game
   * @return {Promise<GameBackend>}
   */
  static async update(game) {
    await GameBackend.checkGameExists(game._id, game.ownerId)
    const newGame = new GameBackend(game)
    delete newGame._id
    delete newGame.wikipedia
    await mongo.collection('games').updateOne({ _id: mongo.getID(game._id) }, {$set: newGame})
    return game ? new GameBackend(game) : null
  }

  /** @param {import('mongodb').ObjectID | string} gameId */
  static async delete(gameId, ownerId) {
    await GameBackend.checkGameExists(gameId, ownerId)
    await mongo.collection('games').deleteOne({ _id: mongo.getID(gameId) })
  }
  async delete(ownerId) {
    await GameBackend.delete(this._id, ownerId)
  }

  /** @param {{[key: string]: any}} filter */
  static async find(filter = {}, ownerId) {
    if(ownerId) filter.ownerId = mongo.getID(ownerId)
    const game = await mongo.collection('games').findOne(filter)
    return game ? new GameBackend(game) : null
  }

  /** @param {import('mongodb').ObjectID | string} _id */
  static async getById(_id, ownerId) {
    return GameBackend.find({_id: mongo.getID(_id)}, ownerId)
  }

  /** @param {{[key: string]: any}} filter */
  static async all(filter, ownerId) {
    if (ownerId) filter.ownerId = mongo.getID(ownerId)
    let games = await mongo.collection('games').find(filter).toArray()
    if (!games) games = []
    return games.map(game => new GameBackend(game))
  }

  async loadWikipedia() {
    this.wikipedia = await WikipediaBackend.getById(this.wikipediaId)
  }
  async getLinks() {
    if(!this.wikipedia) await this.loadWikipedia()
    const pageid = this.steps[this.steps.length - 1]
      ? this.steps[this.steps.length - 1].pageid
      : this.wikipedia.beginPage
    const links = await wikipediaWrapper.getPageLinks(pageid)
    return links
  }
}

module.exports = GameBackend