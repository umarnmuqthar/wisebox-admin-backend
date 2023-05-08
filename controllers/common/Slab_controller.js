const createError = require('http-errors')
const slugify = require('slugify')
const shortId = require('shortid')
const { addSlabSchema } = require('../../utils/validation_schema/slab_schema')
//models
const Chapter = require('../../models/Chapter_model')
const Slab = require('../../models/Slab_model')
const Question = require('../../models/Question_model')
const { generateSlug } = require('../../utils/generateSlug')

module.exports = {
    addSlab: async (req, res, next) => {
        try {
            /* Slab ie. zoology etc 
            - title: ""
            - slug
            - board id
            - class id
            - subject
            - chapter id
            - questions: []
            - createdBy
            -active
            */

            const { idx, title, /* subjectSlug, classSlug, */ chapterId } = await addSlabSchema.validateAsync(req.body)

            //TODO: remove this and send chapter id directly
            const chapter = await Chapter.findById(chapterId)
            // check whether a slab with same id and chapterSlug exists or not
            const dupSlab = await Slab.findOne({ idx, chapter: chapter._id }).exec()
            if(dupSlab) {
                throw createError.BadRequest("Slab with similar index already exists!")
            }
            
            const newSlab = Slab({
                idx,
                title,
                slug: generateSlug(title),
                chapter: chapter._id,
                // subject: chapter.subject,
                createdBy: req.payload.id
            })
            
            const slab = await newSlab.save()

            chapter.slabs.push(slab._id)
            await chapter.save()
            res.send({ data: slab })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    getSlab: async (req, res, next) => {
        try {
            const { slabSlug } = req.params

            if (!slabSlug) {
                throw createError.BadRequest("Slab slug is required")
            }

            const slab = await Slab.findOne({ slug: slabSlug })
                                   .populate("questions")
                                   .exec()
            
            res.send({ data: slab })

        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    deleteSlab: async (req, res, next) => {
        try {
            const { slabSlug } = req.params
            const createdBy = req.payload.id
            
            let queryData = {}
            if(req.payload.role === "admin") {
                // admin can delete any data
                // delete w/o checking the creator
                queryData = { slug: slabSlug }
            } else {
                // check the createdBy info
                queryData = { slug: slabSlug, createdBy }
            }
            const slab = await Slab.findOneAndUpdate(queryData, {deleted: true, idx: -1}).exec()
            if(!slab) throw createError.BadRequest("Access denied / Does not exist")
        

            await Question.deleteMany({ _id: { $in: slab.questions }}).exec()
            
            res.send({ data: { message: "Deleted"} })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    updateSlab: async (req, res, next) => {
        try {
            const { idx, title, active } = req.body
            const { slabSlug } = req.params
            const createdBy = req.payload.id

            let queryData = {}
            if(req.payload.role === "admin") {
                // admin can delete any data
                // delete w/o checking the creator
                queryData = { slug: slabSlug }
            } else {
                // check the createdBy info
                queryData = { slug: slabSlug, createdBy }
            }
            
            //check whether a slab with same id and chapterSlug exists or not
            const slab = await Slab.findOne(queryData).exec()
            if(!slab) throw createError.BadRequest("Access denied / Does not exist")

            const dupSlab = await Slab.findOne({ chapter: slab.chapter, idx }).exec()
            if( dupSlab && (slab.slug !== dupSlab.slug) ) {
                throw createError.BadRequest("Slab with similar index already exists!")
            }
 
            slab.idx = idx
            slab.title = title
            slab.active = active
            if(slab.title !== title) {
                slab.slug = generateSlug(title)
            }


            await slab.save()

            res.send({ data: { message: "updated" } })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    updateSlabPoints: async (req, res, next) => {
        try {
            const { points } = req.body
            // console.log(req.params)
            const { slabSlug } = req.params

            
            const slab = await Slab.findOne({slug: slabSlug}).exec()
            if(!slab) throw createError.BadRequest("Access denied / Does not exist")
 
            slab.points = points

            await slab.save()

            res.send({ data: { message: "updated" } })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },
}

