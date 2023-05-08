const joi = require('@hapi/joi')

const authSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).required(),
    name: joi.string().required()
})

const authLoginSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).required(),
})

module.exports = {
    authSchema,
    authLoginSchema
}