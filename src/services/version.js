import API from '../../server/shared/API'
export default {
  async get() {
    const { data: version } = await API.get('/version/')
    return version
  },
}