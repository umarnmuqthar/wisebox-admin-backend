const joi = require('@hapi/joi')

const addSubjectSchema = joi.object({
    name: joi.string().required(),
    // board: joi.string().required(),
    classId: joi.string().required(),
})

const addChapterSchema = joi.object({
    idx: joi.number().required(),
    name: joi.string().required(),
    // board: joi.string().required(),
    subjectId: joi.string().required(),
})

module.exports = {
    addSubjectSchema,
    addChapterSchema
}