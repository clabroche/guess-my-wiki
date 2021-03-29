const api = require("./API")

class Wikipedia {
  /** @param {Wikipedia | {[key: string]: any}} wikipedia */
  constructor(wikipedia) {
    /** @type {import('mongodb').ObjectID | string} */
    this._id = wikipedia._id
    /** @type {string} */
    this.beginLabel = wikipedia.beginLabel
    /** @type {number} */
    this.beginPage = wikipedia.beginPage
    /** @type {string} */
    this.endLabel = wikipedia.endLabel
    /** @type {number} */
    this.endPage = wikipedia.endPage
    /** @type {number} average computed by builder*/
    this.averageSteps = wikipedia.averageSteps || 0
    /** @type {boolean} tell to builder to recompute stats from this Wikipedia */
    this.needRecompute = wikipedia.needRecompute ? true : false
    /** @type {{link: string, pageid: number}[]} */
    this.steps = wikipedia.steps ? wikipedia.steps : []
    /** @type {('easy' | 'medium' | 'hard' | 'custom')} */
    this.difficulty = wikipedia.difficulty

    if (!this.beginLabel) this.beginLabel = this.steps[0].link
    if (!this.beginPage) this.beginPage = this.steps[0].pageid
    if (!this.endLabel) this.endLabel = this.steps[this.steps.length - 1].link
    if (!this.endPage) this.endPage = this.steps[this.steps.length - 1].pageid
  }
  /** @param {Wikipedia | {[key: string]: any}} wikipedia */
  merge(wikipedia) {
    Object.assign(this, wikipedia)
    return this
  }

  // eslint-disable-next-line no-unused-vars
  async save(...args) {
    let newWikipedia
    if(this._id) {
      newWikipedia = await Wikipedia.update(this)
    } else {
      newWikipedia = await Wikipedia.create(this)
    }
    return this.merge(newWikipedia)
  }

  /**
   * @param {Wikipedia | {[key: string]: any}} wikipedia
   * @return {Promise<Wikipedia>}
   */
  // eslint-disable-next-line no-unused-vars
  static async create(wikipedia, ...args) {
    const clone = JSON.parse(JSON.stringify(wikipedia))
    delete clone._id
    const { data: _wikipedia } = await api.post('/wikipedias', clone)
    return _wikipedia ? new Wikipedia(_wikipedia) : null
  }

  /**
   * @param {Wikipedia | {[key: string]: any}} wikipedia
   * @return {Promise<Wikipedia>}
   * 
   */
  // eslint-disable-next-line no-unused-vars
  static async update(wikipedia, ...args) {
    const { data: _wikipedia } = await api.put(`/wikipedias/${wikipedia._id}`, wikipedia)
    return _wikipedia ? new Wikipedia(_wikipedia) : null
  }

  /** @param {import('mongodb').ObjectID | string} wikipediaId */
  // eslint-disable-next-line no-unused-vars
  static async delete(wikipediaId, ...args) {
    await api.delete(`/wikipedias/${wikipediaId}`)
  }
  async delete() {
    await Wikipedia.delete(this._id)
  }

  /** @param {{[key: string]: any}} filter */
  // eslint-disable-next-line no-unused-vars
  static async find(filter, ...args) {
    const { data: wikipedia } = await api.get('/wikipedias/find', {params: filter})
    return wikipedia ? new Wikipedia(wikipedia) : null
  }

  /** @param {import('mongodb').ObjectID | string} _id */
  // eslint-disable-next-line no-unused-vars
  static async getById(_id, ...args) {
    return Wikipedia.find({ _id })
  }

  /** @param {{[key: string]: any}} filter */
  // eslint-disable-next-line no-unused-vars
  static async all(filter, ...args) {
    let { data: wikipedias } = await api.get('/wikipedias', { params: filter })
    if (!wikipedias) wikipedias = []
    return wikipedias.map(wiki => new Wikipedia(wiki))
  }

  /** @param {string} link */
  // eslint-disable-next-line no-unused-vars
  static async getLinkDefinition(link, ...args) {
    let { data: description } = await api.post('/wikipedias/link-description/' + link)
    return description
  }

  /** @param {string} link */
  // eslint-disable-next-line no-unused-vars
  static async searchLink(link, ...args) {
    let { data: _link } = await api.get('/wikipedias/search-link/' + link)
    return _link
  }
}

module.exports = Wikipedia