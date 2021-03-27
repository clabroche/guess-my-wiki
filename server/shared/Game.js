const api = require("./API")

class Game {
  /** @param {Game | {[key: string]: any}} game */
  constructor(game) {
    /** @type {import('mongodb').ObjectID | string} */
    this._id = game._id
    /** @type {import('mongodb').ObjectID | string} */
    this.ownerId = game.ownerId
    /** @type {('easy' | 'medium' | 'hard')} */
    this.difficulty = game.difficulty
  }
  /** @param {Game | {[key: string]: any}} game */
  merge(game) {
    Object.assign(this, game)
    return this
  }

  // eslint-disable-next-line no-unused-vars
  async save(...args) {
    let newGame
    if(this._id) {
      newGame = await Game.update(this)
    } else {
      newGame = await Game.create(this)
    }
    return this.merge(newGame)
  }

  /**
   * @param {Game | {[key: string]: any}} game
   * @return {Promise<Game>}
   */
  // eslint-disable-next-line no-unused-vars
  static async create(game, ...args) {
    const clone = JSON.parse(JSON.stringify(game))
    delete clone._id
    console.log(api)
    const { data: _game } = await api.post('/games', clone)
    return _game ? new Game(_game) : null
  }

  /**
   * @param {Game | {[key: string]: any}} game
   * @return {Promise<Game>}
   * 
   */
  // eslint-disable-next-line no-unused-vars
  static async update(game, ...args) {
    const { data: _game } = await api.put(`/games/${game._id}`, game)
    return _game ? new Game(_game) : null
  }

  /** @param {import('mongodb').ObjectID | string} gameId */
  // eslint-disable-next-line no-unused-vars
  static async delete(gameId, ...args) {
    await api.delete(`/games/${gameId}`)
  }
  async delete() {
    await Game.delete(this._id)
  }

  /** @param {{[key: string]: any}} filter */
  // eslint-disable-next-line no-unused-vars
  static async find(filter, ...args) {
    const { data: game } = await api.get('/games/find', {params: filter})
    return game ? new Game(game) : null
  }

  /** @param {import('mongodb').ObjectID | string} _id */
  // eslint-disable-next-line no-unused-vars
  static async getById(_id, ...args) {
    return Game.find({ _id })
  }
}

module.exports = Game