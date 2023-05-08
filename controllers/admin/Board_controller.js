const createError = require('http-errors')
const slugify = require('slugify')
const shortId = require('shortid')
const { addBoardSchema, addClassSchema } = require('../../utils/validation_schema/board_schema')
//models
const Board = require('../../models/Board_model')
const ClassModel = require('../../models/Class_model')
const { findOneAndUpdate, findOneAndDelete } = require('../../models/Class_model')
const { generateSlug } = require('../../utils/generateSlug')
// const Subject = require('../../models/Subject_model')

module.exports = {

    addBoard: async (req, res, next) => {
        try {
            const { name } = await addBoardSchema.validateAsync(req.body)

            const newBoard = Board({
                name,
                slug: generateSlug(name),
                createdBy: req.payload.id
            })

            const board = await newBoard.save()

            res.send({ data: board })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    updateBoard: async(req, res, next) => {
        try {
            const { boardSlug } = req.params
            const { name } = req.body

            await Board.findOneAndUpdate({ slug: boardSlug }, {
                name,
                slug: generateSlug(name),
            })

            res.send({ data: { message: "updated" }})
        } catch (err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    deleteBoard: async(req, res, next) => {
        try {
            const { boardSlug } = req.params

            await Board.findOneAndUpdate({ slug: boardSlug }, {
                deleted: true,
            })

            res.send({ data: { message: "deleted"}})
        } catch (err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    addClass: async(req, res, next) => {
        try {
            /* Class ie. 10, 11 etc 
            - name: ""
            - board id
            - slug
            - subjects: []
            - createdBy
            */
            const { name, board } = await addClassSchema.validateAsync(req.body)

            //TODO: try to avoid this
            const boardData = await Board.findById(board)
            
            const newClass = ClassModel({
                name,
                idx: name.split(" ")[1],
                board,
                slug: generateSlug(name),
                createdBy: req.payload.id
            })
            const classResult = await newClass.save()

            boardData.classes.push(classResult._id)
            await boardData.save()

            res.send({ data: classResult })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    },

    updateClass: async(req, res, next) => {
        try {
            const { classSlug } = req.params

            const { name } = req.body

            await ClassModel.findOneAndUpdate( {slug: classSlug }, {
                name,
                idx: name.split(" ")[1],
                slug: generateSlug(name)
            })

            res.send({ data: { messagge: "Updated" } })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        } 
    },

    deleteClass: async(req, res, next) => {
        try {
            const { classSlug } = req.params

            await ClassModel.findOneAndUpdate( {slug: classSlug }, {
                deleted: true
            })

            res.send({ data: { message: "deleted" } })
        } catch(err) {
            if(err.isJoi) err.status = 422
            next(err)
        }
    }
}

