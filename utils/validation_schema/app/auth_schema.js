const joi = require('@hapi/joi')

const sendOtpSchema = joi.object({
    email: joi.string()
            .email()
            .lowercase()
            .messages({
                "string.email": `Invalid Email.`,
                "string.lowercase": `Invalid Email.`,
            })
            .allow(''),
    phone: joi.number()
            .min(1000000000)
            .max(9999999999)
            .messages({
                'number.min': `Invalid phone number.`,
                'number.max': `Invalid phone number.`,
            }),
})

const verifyOtpSchema = joi.object({
    email: joi.string()
            .email()
            .lowercase()
            .messages({
                "string.email": `Invalid Email.`,
                "string.lowercase": `Invalid Email.`,
            })
            .allow(''),
    phone: joi.number()
            .min(1000000000)
            .max(9999999999)
            .messages({
                'number.min': `Invalid phone number.`,
                'number.max': `Invalid phone number.`,
            }),
    otp: joi.number()
            .min(0000)
            .max(9999)
            .required()
            .messages({
                'number.min': `Otp must be 4 digits .`,
                'number.max': `Otp must be 4 digits.`,
                'any.required': 'Otp is required'
            }),
})

const updateStudentSchema = joi.object({
    email: joi.string()
            .email()
            .messages({
                "string.email": `Invalid Email.`,
                "string.lowercase": `Invalid Email.`,
            })
            .allow(''),
    name: joi.string()
            .required(),
    dob: joi.date()
            .required(),
    gender: joi.string()
            .required(),
    school: joi.string()
            .allow(''),
    address: joi.object({
        district: joi.string()
            .required(),
        state: joi.string()
            .required(),
        zip: joi.number()
            .required(),
    }).allow().empty()
})

module.exports = {
    sendOtpSchema,
    verifyOtpSchema,
    updateStudentSchema
}

// joi.alternatives().try(
//     joi.object().keys({
//       email: joi.string().email().lowercase().allow(''),
//       mobile: joi.number(),
//       otp: joi.number().required()
//     }),
//     joi.object().keys({
//       email: joi.string().email().lowercase(),
//       mobile: joi.number().allow(''),
//       otp: joi.number().required()
//     })
//   );