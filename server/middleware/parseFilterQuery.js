const { ObjectID } = require('mongodb')

/**
 * Set a filter field on req. This object can be used to query mongo 
 * @param {import('../typings/parseFilterQuery').FieldDescriptior[]} availableFilters All your filter available (used to protect backend from front that query a forbidden field)
 * @return {import('express').RequestHandler}
 */
module.exports = (availableFilters = []) => (req, res, next) => {
  // try { // Parse query for example ?filter='{field: {$eq: 0}}'
  //   if(req.query.filter) {
  //     const filter = JSON.parse(req.query.filter.toString())
  //     if(filter) {
  //       req.filter = filter
  //       return next()
  //     }
  //   }
  // // eslint-disable-next-line no-empty
  // } catch (err) {}

  try { // Parse query for example ?_id ='mlkdmk'&name="mkdemfklzmf"
    req.filter = {}
    for (const queryField in req.query) {
      const availableFilter = availableFilters.find(conf => conf.field === queryField)
      if(!availableFilter) continue
      let value 
      if (availableFilter.type === 'string') {
        value = req.query[queryField]
      } else if (availableFilter.type === 'number') {
        value = +req.query[queryField]
      } else if (availableFilter.type === 'boolean') {
        value = req.query[queryField] === 'true' ? true : false
      } else if (availableFilter.type === 'objectId') {
        value = new ObjectID(req.query[queryField].toString())
      }
      req.filter[queryField] = value
    }
    next()
  } catch (error) {
    console.error(error)
    res.status(400).send('A field is malformed')
  }
}
