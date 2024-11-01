const Joi = require("joi")


// admin path
module.exports.adminGetUserQuerySchema = Joi.object({
    search: Joi
        .string()
        .optional()
        .allow('')
        .messages({
            'string.base': 'Search term must be a string'
        }),
    limit: Joi
        .number()
        .integer()
        .min(1)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be greater than or equal to 1',
        }),
    page: Joi
        .number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be greater than or equal to 1',
        }),
    orderBy: Joi
        .string()
        .valid('asc', 'desc')
        .default('asc')
        .messages({
            'any.only': 'Order by must be either "asc" or "desc"',
            'string.base': 'Order by must be a string'
        }),
    sortBy: Joi
        .string()
        .valid('firstName', 'lastName', 'id', 'createdAt', 'updatedAt', 'status')
        .default('id')
        .messages({
            'any.only': 'Sort by must be one of "firstName", "lastName", "id", "createdAt", "updatedAt" or "status"',
            'string.base': 'Sort by must be a string'
        }),
    role: Joi
        .string()
        .valid('USER', 'ADMIN', 'PARTNER')
        .optional()
        .messages({
            'any.only': 'Role must be one of "USER", "ADMIN" or "PARTNER"',
            'string.base': 'Role must be a string'
        }),
    status: Joi
        .string()
        .valid("ACTIVE", "INACTIVE", "BANNED")
        .optional()
        .messages({
            'any.only': 'Status by must be one of "ACTIVE","INACTIVE" or "BANNED"',
            'string.base': 'Status by must be a string'
        }),
})
module.exports.adminUpdateUserSchema = Joi.object({
    role: Joi
        .string()
        .valid('USER', 'PARTNER')
        .required()
        .messages({
            "string.empty": "Email is required.",
            'any.only': 'Role must be one of "USER", "ADMIN" or "PARTNER"',
            'string.base': 'Role must be a string'
        }),
})
module.exports.adminGetPartnerQuerySchema = Joi.object({
    search: Joi
        .string()
        .optional()
        .allow('')
        .messages({
            'string.base': 'Search term must be a string'
        }),
    limit: Joi
        .number()
        .integer()
        .min(1)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be greater than or equal to 1',
        }),
    page: Joi
        .number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be greater than or equal to 1',
        }),
    orderBy: Joi
        .string()
        .valid('asc', 'desc')
        .default('asc')
        .messages({
            'any.only': 'Order by must be either "asc" or "desc"',
            'string.base': 'Order by must be a string'
        }),
    sortBy: Joi
        .string()
        .valid("companyName", "userId", "taxNo", "createdAt", "updatedAt")
        .default('id')
        .messages({
            'any.only': 'Sort by must be one of "companyName", "userId", "taxNo", "createdAt" or "updatedAt"',
            'string.base': 'Sort by must be a string'
        }),
    status: Joi
        .string()
        .valid("ACTIVE", "PENDING", "INACTIVE", "BANNED")
        .optional()
        .messages({
            'string.base': 'Sort by must be a string',
            'any.only': 'Status must be one of "ACTIVE", "PENDING", "INACTIVE" or "BANNED"',
        })
})


