const { default: axios } = require('axios');
const WikipediaBackend = require('../shared/WikipediaBackend');
module.exports = {
  async insertNewInDB(search) {
    const begin = await randomPageId()
    const end = await searchInWiki(search)
    const wiki = new WikipediaBackend({
      beginPage: begin.pageid,
      beginLabel: begin.title,
      endPage: end.pageid,
      endLabel: end.title,
      difficulty: 'easy',
    })
    await wiki.save()
    return wiki._id
  },
  getPageLinks,
  getRandomPageLink
}

const wiki = axios.create({
  baseURL: 'https://fr.wikipedia.org/w/api.php'
})
async function searchInWiki(search) {
  const { data: resp } = await wiki.get('', {
    params: {
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: search,
      srlimit: 1
    }
  })
  const res = resp?.query?.search
  if (!res?.length) return
  console.log(res[0])
  return {
    pageid: res[0]?.pageid,
    title: res[0]?.title,
  }
}
async function randomPageId() {
  const { data: resp } = await wiki.get('', {
    params: {
      action: 'query',
      format: 'json',
      list: 'random',
      titles: '',
      rnnamespace: 0,
      rnlimit: 1,
    }
  })
  const res = resp?.query?.random
  if (!res?.length) return
  console.log(res[0])
  return {
    pageid: res[0]?.id,
    title: res[0]?.title
  }
}
/** @param {number} pageid */
async function getPageLinks(pageid) {
  const { data: resp } = await wiki.get('', {
    params: {
      action: 'query',
      format: 'json',
      prop: 'infos',
      generator: 'links',
      pageids: pageid,
      gplnamespace: 0,
      gpllimit: 'max',
    }
  })
  const res = resp?.query?.pages
  if (!res) return []
  return Object.keys(res).map(key => {
    return {
      pageid: +key,
      label: res[key].title
    }
  })
}
/** @param {number} pageid */
async function getRandomPageLink(pageid) {
  const links = await getPageLinks(pageid)
  const index = Math.floor(Math.random() * links.length - 1)
  return links[index]
}