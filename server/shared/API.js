const {default: Axios} = require('axios')
const HttpError = require('./HTTPError')

const headers = {}
const token = global.localStorage
  ? global.localStorage.getItem('token')
  : process.env.API_KEY
if(token) {
  headers.token = token
}

const api =  Axios.create({
  baseURL: `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}`,
  headers: headers
})

api.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  HttpError.next(error)
  return Promise.reject(error);
});

module.exports = api