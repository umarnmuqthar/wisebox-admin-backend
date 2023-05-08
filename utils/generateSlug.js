const slugify = require('slugify')
const shortId = require('shortid')

const generateSlug = (text) => `${slugify(text, { lower: true })}-${shortId.generate()}`

module.exports = {
    generateSlug
}