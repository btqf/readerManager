const { expressjwt } = require('express-jwt');

const { PRIVATE_KEY } = require('../utils/constant');

// 判断token是否过期
const jwtAuth = expressjwt({
  algorithms: ["HS256"],
  secret: PRIVATE_KEY,
  credentialsRequired: true // 设置为false就不进行校验了，游客也可以访问
}).unless({
  path: [
    '/',
    '/user/login'
  ], // 设置 jwt 认证白名单
});

module.exports = jwtAuth;