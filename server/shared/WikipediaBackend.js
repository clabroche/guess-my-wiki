const { default: axios } = require("axios")
const { mongo } = require("../helpers/mongoConnect")
const Wikipedia = require("./Wikipedia")

class WikipediaBackend extends Wikipedia{
  /** @param {WikipediaBackend | {[key: string]: any}} wikipedia */
  constructor(wikipedia) {
    super(wikipedia)
    this._id = this._id ? mongo.getID(this._id) : null
  }
  async save() {
    let newWikipedia
    if (this._id) {
      newWikipedia = await WikipediaBackend.update(this)
    } else {
      newWikipedia = await WikipediaBackend.create(this)
    }
    return this.merge(newWikipedia)
  }
  /**
   * @param {import('mongodb').ObjectID | string} wikipediaId
   */
  static async checkWikipediaExists(wikipediaId) {
    const _wikipedia = await WikipediaBackend.getById(wikipediaId)
    if (!_wikipedia) throw new Error('Wikipedia not exists for this user')
  }

  /**
   * @param {Wikipedia | {[key: string]: any}} wikipedia
   * @return {Promise<Wikipedia>}
   */
  static async create(wikipedia) {
    const clone = JSON.parse(JSON.stringify(wikipedia))
    delete clone._id
    const { insertedId } = await mongo.collection('wikipedias').insertOne(clone)
    clone._id = insertedId
    return clone ? new WikipediaBackend(clone) : null
  }

  /**
   * @param {WikipediaBackend | {[key: string]: any}} wikipedia
   * @return {Promise<WikipediaBackend>}
   */
  static async update(wikipedia) {
    await WikipediaBackend.checkWikipediaExists(wikipedia._id)
    const clone = JSON.parse(JSON.stringify(wikipedia))
    delete clone._id
    await mongo.collection('wikipedias').updateOne({ _id: mongo.getID(wikipedia._id) }, {$set: clone})
    return wikipedia ? new WikipediaBackend(wikipedia) : null
  }

  /** @param {import('mongodb').ObjectID | string} wikipediaId */
  static async delete(wikipediaId) {
    await WikipediaBackend.checkWikipediaExists(wikipediaId)
    await mongo.collection('wikipedias').deleteOne({ _id: mongo.getID(wikipediaId) })
  }
  async delete() {
    await WikipediaBackend.delete(this._id)
  }

  /** @param {{[key: string]: any}} filter */
  static async find(filter = {}) {
    const wikipedia = await mongo.collection('wikipedias').findOne(filter)
    return wikipedia ? new WikipediaBackend(wikipedia) : null
  }

  /** @param {import('mongodb').ObjectID | string} _id */
  static async getById(_id) {
    return WikipediaBackend.find({ _id: mongo.getID(_id) })
  }

  /** @param {('easy' | 'medium' | 'hard' | 'custom')} difficulty*/
  static async getByDifficulty(difficulty) {
    return WikipediaBackend.find({ difficulty })
  }
  
  /** @param {{[key: string]: any}} filter */
  static async all(filter = {}) {
    let wikipedias = await mongo.collection('wikipedias').find(filter).toArray()
    if(!wikipedias) wikipedias = []
    return wikipedias.map(wiki => new WikipediaBackend(wiki))
  }

  /** @param {string} link */
  static async getLinkDefinition(link) {

    const wiki = axios.create({
      baseURL: 'https://fr.wikipedia.org/w/api.php'
    })

    const params = {
      action: 'query',
      format: 'json',
      prop: 'extracts',
      explaintext: 1,
      exintro: 1,
    }
    if (typeof link === 'number') {
      params.pageids = link
    } else {
      params.titles = link
    }
    const { data: resp } = await wiki.get('', { params })
    const res = resp?.query?.pages
    const _pageid = Object.keys(res).pop()
    if (!_pageid) return ''
    return res[_pageid]?.extract
  }
}

module.exports = WikipediaBackend