const Joi = require("joi")

// partner
module.exports.createPartnerSchema = Joi.object({
    companyName: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'any.required': 'Company Name is required'
        }),
    address: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Address must be a string',
            'any.required': 'Address is required'
        }),
    taxNo: Joi
        .string()
        .required()
        .length(13)
        .messages({
            'string.base': 'Address must be a string',
            'any.required': 'Address is required'
        }),
    bankName: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Bank name must be a string.',
            'string.empty': 'Bank name is required.',
            'any.required': 'Bank name is required.'
        }),
    bankAccount: Joi.string()
        .pattern(/^[0-9]{8,16}$/) // Allows only digits, 8-16 characters long
        .required()
        .messages({
            'string.base': 'Bank account must be a string of digits.',
            'string.empty': 'Bank account is required.',
            'string.pattern.base': 'Bank account must be between 8 and 16 digits.',
            'any.required': 'Bank account is required.'
        })
})


module.exports.updatePartnerSchema = Joi.object({
    address: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Address must be a string',
            'any.required': 'Address is required'
        }),
    bankName: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Bank name must be a string.',
            'string.empty': 'Bank name is required.',
            'any.required': 'Bank name is required.'
        }),
    bankAccount: Joi.string()
        .pattern(/^[0-9]{8,16}$/) // Allows only digits, 8-16 characters long
        .required()
        .messages({
            'string.base': 'Bank account must be a string of digits.',
            'string.empty': 'Bank account is required.',
            'string.pattern.base': 'Bank account must be between 8 and 16 digits.',
            'any.required': 'Bank account is required.'
        })
})