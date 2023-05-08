const joi = require('@hapi/joi')

/* Stream
    - name
    - board
    - classId
    - subjects
*/
const addStreamSchema = joi.object({
    name: joi.string().required(),
    board: joi.string().required(),
    classId: joi.string().required(),
    subjects: joi.array().items(
        joi.string().allow("")
    )/* .required() */,
})

/* Stream
    - name
    - subjects
    - active
*/
const updateStreamSchema = joi.object({
    name: joi.string(),
    subjects: joi.array().items(
        joi.string().allow("")
    )/* .required() */,
    active: joi.boolean(),
})

module.exports = {
    addStreamSchema,
    updateStreamSchema
}