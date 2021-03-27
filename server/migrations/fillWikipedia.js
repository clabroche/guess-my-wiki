const WikipediaBackend = require("../shared/WikipediaBackend")
const PromiseB = require('bluebird')
const wikipediaWrapper = require("../helpers/wikipediaWrapper")
module.exports = async () => {
  const wikipedias = await WikipediaBackend.all({})
  if(!wikipedias?.length) {
    await PromiseB.map(Array(1000).fill(), async () => {
      await wikipediaWrapper.insertNewInDB()
      throw new Error('lmkj')
    }, {concurrency: 1})
  }

}

