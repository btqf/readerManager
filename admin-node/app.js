const express = require('express')
const router = require('./router/index')
// const fs = require('fs')
// const https = require('https')
const bodyParser = require('body-parser')
const cors = require('cors')
// 创建express应用
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use('/', router)

// const privateKey = fs.readFileSync('https/btqf.fun.key', 'utf8')
// const certificate = fs.readFileSync('https/btqf.fun.pem', 'utf8')
// const credentials = { key: privateKey, cert: certificate }
// const httpsServer = https.createServer(credentials, app)
// const SSLPORT = 5000
// httpsServer.listen(SSLPORT, function() {
//   console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT)
// })

const serve = app.listen(5000, function() {
    const {address, port} = serve.address()
    // console.log('Http Server is running on http://%s:%s', address, port)
})