const { default: axios } = require('axios');
const WikipediaBackend = require('../shared/WikipediaBackend');
const textversionjs = require('textversionjs')
const sort = require('fast-sort');
const { mongo } = require('./mongoConnect');
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
  return {
    pageid: res[0]?.id,
    title: res[0]?.title
  }
}
/** @param {number} pageid */
async function getPageLinks(pageid, max = 10) {
  const fromMongo = await mongo.collection('links').findOne({pageid})
  if (fromMongo?.links) {
    return fromMongo.links.slice(0, max)
  }
  const params = {
    action: 'parse',
    format: 'json',
    prop: 'text|links',
    formatversion: 2,
  }
  if(typeof pageid === 'number'){
    params.pageid = pageid
  } else {
    params.page = pageid
  }
  const { data: resp } = await wiki.get('', {params})
  const links = resp?.parse?.links
  /** @type {string} */
  let text = resp?.parse?.text
  if (!links) return []
  text = textversionjs(text)
  text = text.substring(0, 100000)
  const alllinks = links.filter(link => text.indexOf(link.title) !== -1 && link.ns === 0 && Number.isNaN(+link.title))
  const allLinksSorted = sort(alllinks).asc(a => text.indexOf(a.title))
  const allFormatedLinks = allLinksSorted.map(link => ({ label: link.title, pageid: link.title }))
  await mongo.collection('links').updateOne({pageid},{$set: {links:allFormatedLinks}}, {upsert: true} )
  return allFormatedLinks.slice(0, max)
}
/** @param {number} pageid */
async function getRandomPageLink(pageid) {
  const links = await getPageLinks(pageid)
  const index = Math.floor(Math.random() * links.length - 1)
  return links[index]
}
