const joi = require('@hapi/joi')

const addSlabSchema = joi.object({
    idx: joi.number().required(),
    title: joi.string().required(),
    // board: joi.string().required(),
    chapterId: joi.string().required(),
})

module.exports = {
    addSlabSchema
}