const joi = require('@hapi/joi')

const addBoardSchema = joi.object({
    name: joi.string().required()
})

const addClassSchema = joi.object({
    name: joi.string().required(),
    board: joi.string().required()
})

module.exports = {
    addBoardSchema,
    addClassSchema
}