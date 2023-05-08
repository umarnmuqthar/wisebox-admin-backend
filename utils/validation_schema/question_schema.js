const joi = require('@hapi/joi')

const addQuestionSchema = joi.object({
    slabSlug: joi.string().required(),
    question: joi.string().required(),
    questionMeta: joi.object().allow({}).optional(),
    answers: joi.array().items(
        joi.string().allow("")
    ).required(),
    answer: joi.string().max(1).required(),
    explanation: joi.string().allow('').optional(),
    explanationMeta: joi.object().allow({}).optional(),
    active: joi.boolean().optional()
})

const updateQuestionSchema = joi.object({
    question: joi.string().required(),
    questionMeta: joi.object().allow({}).optional(),
    answers: joi.array().items(
        joi.string().allow("")
    ).required(),
    answer: joi.string().max(1).required(),
    explanation: joi.string().allow('').optional(),
    explanationMeta: joi.object().allow({}).optional(),
    active: joi.boolean().optional()
})

module.exports = {
    addQuestionSchema,
    updateQuestionSchema
}