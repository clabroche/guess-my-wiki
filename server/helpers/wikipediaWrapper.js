const { default: axios } = require('axios');
const WikipediaBackend = require('../shared/WikipediaBackend');
module.exports = {
  async insertNewInDB(search) {
    const wiki = new WikipediaBackend({
      beginPage: await searchInWiki(search),
      endPage: await randomPageId(),
      difficulty: 'easy',
    })
    await wiki.save()
    return wiki._id
  },
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
  return res[0]?.pageid
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
  return res[0]?.id
}
async function getPageLinks({pageid, lastlink}) {
  const { data: resp } = await wiki.get('', {
    params: lastlink || {
      action: 'query',
      format: 'json',
      prop: 'links',
      pageids: pageid,
      plnamespace: 0,
      pllimit: 100,
    }
  })
  const res = resp?.query?.pages
  // if (!res?.length) return
  const links = res[pageid]?.links
  if (!links?.length) return []
  return links.map(({ title }) => {
    return {
      action: 'query',
      format: 'json',
      prop: 'links',
      pageids: pageid,
      plnamespace: 0,
      pllimit: 100,
      plcontinue: `${pageid}|0|${title}`
    }
  })
}
async function getRandomPageLink({pageid, lastlink}) {
  const links = await getPageLinks({pageid, lastlink})
  const index = Math.floor(Math.random() * links.length - 1)
  return links[index]
}