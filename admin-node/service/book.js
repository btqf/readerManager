const Book = require("../models/Book")
const db = require('../db/index')
const _ = require('lodash')

function exists(book) {
    const { title, author, publisher } = book
    const sql = `select * from book where title='${title}' and
    author='${author}' and publisher='${publisher}'`
    return db.queryOne(sql)
}
 
async function removeBook(book) {
    if (book) {
        book.reset()
        if (book.fileName) {
            const removeBookSql = `delete from book where fileName='${book.fileName}'`
            const removeContentSql = `delete from contents where fileName='${book.fileName}'`
            await db.querySql(removeBookSql)
            await db.querySql(removeContentSql)
        }
    }
}

async function insertContent(book) {
    const contents = book.getContents()
    if (contents && contents.length > 0) {
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i]
            const _content = _.pick(content, [
                'fileName',
                'id',
                'href',
                'text',
                'order',
                'level',
                'label',
                'pid',
                'navId'
            ])
            // console.log('_content', _content)
            await db.insert(_content, 'contents')
        }
    }
}

async function insertBook(book) {
  return new Promise(async (resolve, reject) => {
      try {
        if (book instanceof Book) {
            // 确认是否已传入book对象，防止前端传入多次book对象
            const result = await exists(book)
            if (result) {
                await removeBook(book)
                reject(new Error('电子书已存在'))
            } else {
                // 分别将书籍基础信息和目录存入两张数据表
                await db.insert(book.toDb(), 'book')
                await insertContent(book)
                resolve()
            }
        } else {
            reject(new Error('电子书对象不符合规范'))
        }
      } catch(e) {
          reject(e)
      }
  })
}

async function getBook(fileName) {
    return new Promise(async (resolve,reject) => {
        const bookSql = `select * from book where fileName='${fileName}'`
        const contentSql = `select * from contents where fileName='${fileName}' order by \`order\``
        const book = await db.queryOne(bookSql)
        const contents = await db.querySql(contentSql)
        if (book) {
            book.cover = Book.genCoverUrl(book)
            book.contentsTree = Book.getContentsTree(contents)
            resolve({book})
        } else {
            reject(new Error('电子书不存在'))
        } 
        
    })
}

function updateBook(book) {
    return new Promise(async (resolve, reject) => {
        try {
            if (book instanceof Book) {
                const result = await getBook(book.fileName)
                if (result) {
                    const model = book.toDb()
                    if (+result.updateType === 0) {
                        reject(new Error('内置图书不能编辑'))
                    } else {
                        await db.update(model, 'book', `where fileName='${book.fileName}'`)
                        resolve()
                    }
                } else {
                    reject(new Error('电子书对象不符合规范'))
                }
            }
        } catch(e) {
            reject(e)
        }
    })
}

async function getCategory() {
    const sql = 'select * from category order by category asc'
    const result = await db.querySql(sql)
    const categoryList = []
    result.forEach(item => {
        categoryList.push({
            label: item.categoryText,
            value: item.category,
            num: item.num
        })
    })
    return categoryList
}

async function listBook(query) {
    const {
        category,
        author,
        title,
        sort,
        page = 1,
        pageSize = 20
    } = query
    const offset = (page - 1) * pageSize
    let bookSql = 'select * from book'
    let where = 'where'
    title && (where = db.andLike(where, 'title', title))
    author && (where = db.andLike(where, 'author', author))
    category && (where = db.and(where, 'categoryText', category))
    if (where !== 'where') {
        bookSql = `${bookSql} ${where}`
    }
    if (sort) {
        const symbol = sort[0]
        const column = sort.slice(1, sort.length)
        const order = symbol === '+' ? 'asc':'desc'
        bookSql = `${bookSql} order by \`${column}\` ${order}`
    }
    let countSql = `select count(*) as count from book`
    if (where !== 'where') {
        countSql = `${countSql} ${where}`
    }
    const count = await db.querySql(countSql)
    bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
    const list = await db.querySql(bookSql)
    list.forEach(book => book.cover = Book.genCoverUrl(book))
    return { list, count: count[0].count, page, pageSize }
}

async function deleteBook(fileName) {
    return new Promise(async (resolve, reject) => {
        let book = await getBook(fileName)
        if (book) {
            if (+book.updateType === 0) {
                reject(new Error('内置电子书不能删除'))
            } else {
                const bookObj = new Book(null, book) 
                const sql = `delete from book where fileName='${fileName}'`
                db.querySql(sql).then(() => {
                    bookObj.reset()
                    resolve()
                })
            }
        } else {
            reject(new Error('电子书不存在'))
        }
    })
}


module.exports = {
    insertBook,
    getBook,
    updateBook,
    getCategory,
    listBook,
    deleteBook
} 