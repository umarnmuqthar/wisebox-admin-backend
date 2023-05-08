const createError = require('http-errors')
const slugify = require('slugify')
const shortId = require('shortid')
const Document = require('../../models/Document_model')
const { addChapterSchema } = require('../../utils/validation_schema/subject_schema')
const { generateSlug } = require('../../utils/generateSlug')

module.exports = {
    getCompanyTemplates: async (req, res, next) => {
        try {
            const { slug } = req.params

            if(!slug) throw createError.BadRequest('Slug is required')
            
            const document = await Document.findOne({ slug })

            if(!document) throw createError.NotFound()

            res.send(document)
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    getAllCompanyTemplates: async (req, res, next) => {
        try {
            
            const documents = await Document
                                .find()
                                .select("_id slug description title keywords")

            res.send(documents)
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

}