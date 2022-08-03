const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('./constant')

function isObject(o) {
  return Object.prototype.toString.call(o)  === '[object Object]'
}
// 对密码加密
function md5(s) {
    // 参数需要为 String 类型
    return crypto.createHash('md5')
      .update(String(s)).digest('hex');
}

// 解析token
function decode(req) {
    const authorization = req.get('Authorization')
    // console.log(authorization)
    let token = ''
    if (authorization.indexOf('Bearer') >= 0) {
      token = authorization.replace('Bearer ', '')
    } else {
      token = authorization
    }
    return jwt.verify(token, PRIVATE_KEY)
}

module.exports = { md5, decode, isObject }