const createError = require('http-errors')
//models
const Stream = require('../../models/Stream_model')
const { generateSlug } = require('../../utils/generateSlug')
const Class_model = require('../../models/Class_model')
const { addStreamSchema, updateStreamSchema } = require('../../utils/validation_schema/stream_schema')

module.exports = {

    getStreams: async(req, res, next) => {
        try {
            const { classSlug } = req.params

            if(!classSlug) throw createError.BadRequest('classSlug is required')

            //find id of class
            const classData = await Class_model.findOne({slug: classSlug, deleted: false})

            if(!classData) {
                throw createError.NotFound('No Class Found')
            } 

            const streams = await Stream.find({ classId: classData._id, deleted: false })
                                    .populate({
                                        path: "board",
                                        match: {deleted: false},
                                        // selecct: "name subjects slug idx",
                                        // options: { sort: { 'idx': -1 } }
                                    })
                                    .populate({
                                        path: "classId",
                                        match: {deleted: false},
                                        // selecct: "name subjects slug idx",
                                        // options: { sort: { 'idx': -1 } }
                                    })
                                    .populate({
                                        path: "subjects",
                                        match: {deleted: false},
                                        // selecct: "name subjects slug idx",
                                        options: { sort: { 'idx': -1 } }
                                    })
                                    .sort({ 'name': -1 })
                                    .exec()

            res.send({ data: streams})
        } catch (err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    addStream: async (req, res, next) => {
        
        /* Stream
        - name
        - slug
        - board
        - classId
        - subjects
        - createdBy
        - active
        - deleted
        */
        try {
            const { name, board, classId, subjects } = await addStreamSchema.validateAsync(req.body)

            const newStream = Stream({
                name,
                slug: generateSlug(name),
                board,
                classId,
                subjects,
                createdBy: req.payload.id
            })

            const stream = await newStream.save()

            res.send({ data: stream })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    updateStream: async(req, res, next) => {
        try {
            const { streamSlug } = req.params

            const { name, subjects, active } = await updateStreamSchema.validateAsync(req.body)

            await Stream.findOneAndUpdate({ slug: streamSlug }, {
                name,
                slug: generateSlug(name),
                subjects,
                active
            })

            res.send({ data: { message: "updated" }})
        } catch (err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    deleteStream: async(req, res, next) => {
        try {
            const { streamSlug } = req.params

            await Stream.findOneAndUpdate({ slug: streamSlug }, {
                deleted: true,
            })

            res.send({ data: { message: "deleted"}})
        } catch (err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },
}

