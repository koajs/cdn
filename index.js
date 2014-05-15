
module.exports = function () {
  return function* cdn(next) {
    this.response.set('X-Content-Type-Options', 'nosniff')
    this.response.set('X-Frame-Options', 'deny')
    this.response.set('X-XSS-Protection', '1; mode=block')

    this.response.set('Access-Control-Allow-Origin', '*')
    this.response.set('Access-Control-Allow-Methods', 'HEAD,GET,OPTIONS')

    switch (this.request.method) {
    case 'HEAD':
    case 'GET':
      return yield* next
    case 'OPTIONS':
      this.response.set('Allow', 'HEAD,GET,OPTIONS')
      this.response.status = 204
      return
    default:
      this.response.set('Allow', 'HEAD,GET,OPTIONS')
      this.response.status = 501
      this.response.body = 'Not Implemented'
      return
    }
  }
}
