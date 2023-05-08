const createError = require('http-errors')
//models
const Board = require('../../models/Board_model')
const ClassModel = require('../../models/Class_model')
const Subject = require('../../models/Subject_model')

module.exports = {
    getBoards: async (req, res, next) => {
        try {
            const boards = await Board.find({deleted: false})
                .populate({
                    path: "classes",
                    match: {deleted: false},
                    selecct: "name subjects slug idx",
                    options: { sort: { 'idx': -1 } }
                })
                .sort({ 'name': -1 })
                .exec()

                res.send({ data: boards })
        } catch (err) {
            if (err.isJoi) err.status = 422
            next(err)
        }
    },

    getBoard: async (req, res, next) => {
        try {
            const { boardSlug } = req.params

            //validation
            if (!boardSlug) {
                throw createError.BadRequest("Board slug is required")
            }

            const board = await Board.findOne({ slug: boardSlug })
                .populate([
                    {
                        path: "classes",
                        match: {deleted: false},
                        populate: {
                            path: "subjects",
                            select: "name slug",
                            match: {deleted: false},
                        },
                        select: "name subjects slug idx",
                        options: {
                            sort: { idx: -1 }
                        }
                    }
                ])
                .exec()

            res.send({ data: board })
        } catch (err) {
            if (err.isJoi) err.status = 422
            next(err)
        }
    },

    getClass: async (req, res, next) => {
        try {
            const { classSlug } = req.params

            //validation
            if (!classSlug) {
                throw createError.BadRequest("Class slug is required")
            }

            const classItem = await ClassModel.findOne({ slug: classSlug })
                .populate([
                    {
                        path: "subjects",
                        match: {deleted: false},
                        populate: {
                            path: "chapters",
                            select: "name slug",
                            match: {deleted: false},
                        },
                        select: "name chapters slug",
                        options: {
                            sort: { name: 1 }
                        }
                    }
                ])
                .exec()

            res.send({ data: classItem })
        } catch (err) {
            if (err.isJoi) err.status = 422
            next(err)
        }
    },

    getSubjects: async (req, res, next) => {
        try {
            /* 
            - class slug
            - or class Id 
            */
            const { classSlug } = req.params

            if (!classSlug) {
                throw createError.BadRequest("Class slug is required")
            }

            const classData = await ClassModel.findOne({ slug: classSlug })

            const subjects = await Subject.find({ classId: classData._id, deleted: false })
                .populate({
                    path: "chapters",
                    select: "-_v",
                    match: {deleted: false},
                    options: { sort: { 'idx': 1 } }
                })
                .sort({ 'name': 1 })
                .exec()
            res.send({ data: subjects })
        } catch (err) {
            if (err.isJoi) err.status = 422
            next(err)
        }
    },

    getSubject: async (req, res, next) => {
        try {
            const { subjectSlug } = req.params

            //validation
            if (!subjectSlug) {
                throw createError.BadRequest("Subject slug is required")
            }

            const subject = await Subject.findOne({ slug: subjectSlug })
                .populate([
                    {
                        path: "chapters",
                        match: {deleted: false},
                        populate: {
                            path: "slabs",  
                            select: "title slug",
                            match: {deleted: false},
                        },
                        select: "name slabs slug active idx",
                        options: {
                            sort: { idx: 1 }
                        }
                    }
                ])
                .exec()

            res.send({ data: subject })
        } catch (err) {
            if (err.isJoi) err.status = 422
            next(err)
        }
    },
}
