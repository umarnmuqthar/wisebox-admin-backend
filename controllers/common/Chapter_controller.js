const createError = require('http-errors')
const slugify = require('slugify')
const shortId = require('shortid')
const Chapter = require('../../models/Chapter_model')
const Subject = require('../../models/Subject_model')
const { addChapterSchema } = require('../../utils/validation_schema/subject_schema')
const { generateSlug } = require('../../utils/generateSlug')

module.exports = {
    addChapter: async (req, res, next) => {
        /* chapter ie. zoology- animal kingdom etc 
        - name: ""
        - board id
        - class id
        - subject id
        - slabs: []
        */
        try {
            const { idx, subjectId, name,/*  board, classId */ } = await addChapterSchema.validateAsync(req.body)
            
            // check whether a slab with same id and subjectId exists or not
            const dupChapter = await Chapter.findOne({ idx, subject: subjectId }).exec()
            if(dupChapter) {
                throw createError.BadRequest("Chapter with similar index already exists!")
            }

            const subjectData = await Subject.findById(subjectId)

            /* validate subject present or not */
            const newChapter = Chapter({
                idx,
                name,
                // board,
                // classId,
                subject: subjectId,
                slug: generateSlug(name),
                createdBy: req.payload.id
            })

            const chapter = await newChapter.save()

            subjectData.chapters.push(chapter._id)
            await subjectData.save()

            res.send({ data: chapter })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    deleteChapter: async (req, res, next) => {
        try {
            const { chapterSlug } = req.params 
            const createdBy = req.payload.id

            let queryData = {}
            if(req.payload.role === "admin") {
                // admin can delete any data
                // delete w/o checking the creator
                queryData = { slug: chapterSlug }
            } else {
                // check the createdBy info
                queryData = { slug: chapterSlug, createdBy }
            }

            const chapter = await Chapter.findOneAndUpdate({ slug: chapterSlug }, {deleted: true, idx: -1}).exec()
            if(!chapter) throw createError.BadRequest("Access denied / Does not exist")

            res.send({ data: { message: "deleted" } })
        } catch (err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    getChapter: async (req, res, next) => {
        try {
            const { chapterSlug } = req.params

            //validation
            if (!chapterSlug) {
                throw createError.BadRequest("Chapter slug is required")
            }

            const chapter = await Chapter.findOne({ slug: chapterSlug })
                .populate([
                    {
                        path: "slabs",
                        match: {deleted: false},
                        populate: {
                            path: "questions",
                            select: "slug -_id",
                        },
                        select: "title questions slug active idx -_id",
                        options: {
                            sort: { idx: 1 }
                        }
                    }
                ])
                .exec()

            res.send({ data: chapter })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },
    
    updateChapter: async (req, res, next) => {
        try {
            const { idx, name, active } = req.body
            const { chapterSlug } = req.params 
            const createdBy = req.payload.id

            let queryData = {}
            if(req.payload.role === "admin") {
                // admin can delete any data
                // delete w/o checking the creator
                queryData = { slug: chapterSlug }
            } else {
                // check the createdBy info
                queryData = { slug: chapterSlug, createdBy }
            }

            //check whether a slab with same id and chapterSlug exists or not
            const chapter = await Chapter.findOne(queryData).exec()
            if(!chapter) throw createError.BadRequest("Access denied / Does not exist")

            const dupChapter = await Chapter.findOne({ subject: chapter.subject, idx }).exec()
            if( dupChapter && (chapter.slug !== dupChapter.slug) ) {
                throw createError.BadRequest("Chapter with similar index already exists!")
            }
 
            chapter.idx = idx
            chapter.name = name
            chapter.active = active
            if(chapter.name !== name) {
                chapter.slug = generateSlug(name)
            }
            await chapter.save()


            res.send({ data: { message: "deleted" } })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    }

}