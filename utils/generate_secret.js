const crypto = require('crypto')
const slugify = require('slugify')
const shortId = require('shortid')

const key1 = crypto.randomBytes(32).toString('hex')
const key2 = crypto.randomBytes(32).toString('hex')

console.table({ key1, key2 })
console.log(slugify("Hello world")+"-"+shortId.generate())