const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ?
  '/users/upload/admin-upload-ebook' : '/root/upload/admin-upload-ebook';

const UPLOAD_URL = env === 'dev' ?
  'http://localhost:8089/admin-upload-ebook': 'http://www.btqf.fun:8089/admin-upload-ebook'

const OLD_UPLOAD_URL = env === 'dev' ? 
  'http://localhost:8089/book/img': 'http://www.btqf.fun:8089/book/img'

module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS: 0,
    CODE_TOKEN_EXPIRED: -2,
    debug: true,
    PWD_SALT: 'admin_imooc_node',
    PRIVATE_KEY: 'admin_node',
    JWT_EXPIRED: 60 * 60, // token失效时间
    UPLOAD_PATH,
    UPLOAD_URL,
    OLD_UPLOAD_URL,
    MIME_TYPE_EPUB: 'application/epub+zip'
}
 