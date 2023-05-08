const joi = require('@hapi/joi')

const addTeacherSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.string().min(8).required(),
})

const updateTeacherSchema = joi.object({
    email: joi.string().email().required(),
    name: joi.string(),
    password: joi.string().min(8),
    confirmPassword: joi.string().min(8),
    active: joi.boolean()
})

module.exports = {
    addTeacherSchema,
    updateTeacherSchema
}