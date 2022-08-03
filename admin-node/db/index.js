const mysql = require('mysql')
const { host, user, password, database } = require('./config')
const debug = require('../utils/constant').debug
const { isObject } = require('../utils/index')

function connect() {
    return mysql.createConnection({
        host,
        user,
        password,
        database,
        multipleStatements: true,
        acquireTimeout: 1000000,
        connectTimeout: 30000
    })
}

function querySql(sql) {
    const conn = connect()
    // debug && console.log(sql)
    return new Promise((resolve, reject) => {
      try {
        conn.query(sql, (err, results) => {
          if (err) {
            // debug && console.log('查询失败，原因:' + JSON.stringify(err))
            reject(err)
          } else {
            // debug && console.log('查询成功', JSON.stringify(results))
            resolve(results)
          }
        })
      } catch (e) {
        reject(e)
      } finally {
        conn.end()
      }
    })
  }

  function queryOne(sql) {
    return new Promise((resolve, reject) => {
      querySql(sql)
        .then(results => {
          if (results && results.length > 0) {
            resolve(results[0])
          } else {
            resolve(null)
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  function insert(model, tablename) {
    return new Promise((resolve, reject) => {
      // 判断是否为对象
      if (! isObject(model)) {
        reject(new Error('插入数据库失败，插入数据非对象'))
      } else {
        const keys = []
        const values = []
        Object.keys(model).forEach(key => {
          // 确定key是否在model上，而不是在父类原型链上
          if (model.hasOwnProperty(key)) {
            // 为了避免查询字段中存在查询语句关键字，对查询字段加入反标号
            keys.push(`\`${key}\``)
            values.push(`'${model[key]}'`)
          }
        })
        if (keys.length > 0 && values.length > 0) {
          let sql = `INSERT INTO \`${tablename}\`(`
          const keysString = keys.join(',')
          const valuesString = values.join(',')
          sql = `${sql}${keysString}) VALUES (${valuesString})` 
          // debug && console.log(sql)
          const conn = connect()
          try {
            conn.query(sql, (err, result) => {
              if (err) {
                reject(err)
              } else {
                resolve(result)
              }
            })
          } catch(e) {
            reject(e)
          } finally {
            conn.end()
          }
        } else {
          reject(new Error('插入数据库失败，对象没有包含任何属性'))
        }
      }
    })
  }

  function update(model, tablename, where) {
    return new Promise((resolve, reject) => {
      if (!isObject(model)) {
        reject(new Error('插入数据库失败，插入数据非对象'))
      } else {
        const entry = []
        Object.keys(model).forEach(key => {
          if (model.hasOwnProperty(key)) {
            entry.push(`\`${key}\`='${model[key]}'`)
          }
        })
        if (entry.length > 0) {
          let sql = `UPDATE \`${tablename}\` SET`
          sql = `${sql} ${entry.join(',')} ${where}`
          const conn = connect()
          try {
            conn.query(sql, (err, result) => {
              if (err) {
                reject(err)
              } else {
                resolve(result)
              }
            })
          } catch(e) {
            reject(e)
          } finally {
            conn.end()
          }
        }  else {
          reject(new Error('插入数据库失败，对象没有包含任何属性'))
        }
      }
    })
  }

  function and(where, k, v) {
    if (where === 'where') {
      return `${where} \`${k}\`='${v}'`
    } else {
      return `${where} and \`${k}\`='${v}'`
    }
  }

  function andLike(where, k, v) {
    if (where === 'where') {
      return `${where} \`${k}\` like '%${v}%'`
    } else {
      return `${where} and \`${k}\` like '%${v}%'`
    }
  }

  module.exports = { 
    querySql, 
    queryOne,
    insert,
    update,
    and,
    andLike
  }