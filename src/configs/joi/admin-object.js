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
        .valid('USER','ADMIN' ,'PARTNER')
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
module.exports.adminUpdatePartnerSchema = Joi.object({
    status: Joi
        .string()
        .valid("ACTIVE", "PENDING", "INACTIVE", "BANNED")
        .required()
        .messages({
            'string.base': 'Sort by must be a string',
            'any.only': 'Status must be one of "ACTIVE", "PENDING", "INACTIVE" or "BANNED"',
            'any.required': 'Status is required'
        })
})
module.exports.adminCreatePromotionSchema = Joi.object({
    name: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'any.required': 'Name is required'
        }),
    description: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'any.required': 'Name is required'
        }),
    discountPercent: Joi
        .number()
        .integer()
        .min(0)
        .max(100)
        .optional()
        .messages({
            'number.base': 'Discount percent must be a number',
            'number.integer': 'Discount percent must be an integer',
            'number.min': 'Discount percent must be at least 0',
            'number.max': 'Discount percent must be at most 100',
        }),
    discountValue: Joi
        .number()
        .precision(2)
        .positive()
        .optional()
        .messages({
            'number.base': 'Discount value must be a number',
            'number.positive': 'Discount value must be greater than zero',
        }),
    minimumSpend: Joi
        .number()
        .precision(2)
        .positive()
        .optional()
        .messages({
            'number.base': 'Minimum spend must be a number',
            'number.positive': 'Minimum spend must be greater than zero',
        }),
    maxDiscount: Joi
        .number()
        .precision(2)
        .positive()
        .required()
        .messages({
            'number.base': 'Max discount must be a number',
            'number.positive': 'Max discount must be greater than zero',
            'any.required': 'Max discount is required'
        }),
    usageLimit: Joi
        .number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Usage limit must be a number',
            'number.integer': 'Usage limit must be an integer',
            'number.positive': 'Usage limit must be greater than zero',
            'any.required': 'Usage limit is required'
        }),
    userLimit: Joi
        .number()
        .integer()
        .min(1)
        .optional()
        .messages({
            'number.base': 'User limit must be a number',
            'number.integer': 'User limit must be an integer',
            'number.min': 'User limit must be at least 0',
        }),
    isActive: Joi
        .boolean()
        .default(false)
        .messages({
            'boolean.base': 'Is active must be a  boolean'
        }),
    startDate: Joi
        .date()
        .iso()
        .min('now')
        .required()
        .messages({
            'date.base': 'Start date must be a valid date.',
            'date.min': 'Start date cannot be earlier than today.',
            'any.required': 'Start date is required.',
        }),
    endDate: Joi
        .date()
        .iso()
        .min(Joi.ref('checkinDate'))
        .required()
        .messages({
            'date.base': 'End date must be a valid date.',
            'date.min': 'End date cannot be earlier than today.',
            'any.required': 'End date is required.',
        }),
})
module.exports.adminUpdatePromotionSchema = Joi.object({
    name: Joi
        .string()
        .optional()
        .messages({
            'string.base': 'Name must be a string',
        }),
    description: Joi
        .string()
        .optional()
        .messages({
            'string.base': 'Name must be a string',
        }),
    discountPercent: Joi
        .number()
        .integer()
        .min(0)
        .max(100)
        .optional()
        .messages({
            'number.base': 'Discount percent must be a number',
            'number.integer': 'Discount percent must be an integer',
            'number.min': 'Discount percent must be at least 0',
            'number.max': 'Discount percent must be at most 100',
        }),
    discountValue: Joi
        .number()
        .precision(2)
        .positive()
        .optional()
        .messages({
            'number.base': 'Discount value must be a number',
            'number.positive': 'Discount value must be greater than zero',
        }),
    minimumSpend: Joi
        .number()
        .precision(2)
        .positive()
        .optional()
        .messages({
            'number.base': 'Minimum spend must be a number',
            'number.positive': 'Minimum spend must be greater than zero',
        }),
    maxDiscount: Joi
        .number()
        .precision(2)
        .positive()
        .optional()
        .messages({
            'number.base': 'Max discount must be a number',
            'number.positive': 'Max discount must be greater than zero',
        }),
    usageLimit: Joi
        .number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'Usage limit must be a number',
            'number.integer': 'Usage limit must be an integer',
            'number.positive': 'Usage limit must be greater than zero',
        }),
    userLimit: Joi
        .number()
        .integer()
        .min(1)
        .optional()
        .messages({
            'number.base': 'User limit must be a number',
            'number.integer': 'User limit must be an integer',
            'number.min': 'User limit must be at least 0',
        }),
    isActive: Joi
        .boolean()
        .default(false)
        .messages({
            'boolean.base': 'Is active must be a  boolean'
        }),
    startDate: Joi
        .date()
        .iso()
        .min('now')
        .optional()
        .messages({
            'date.base': 'Start date must be a valid date.',
            'date.min': 'Start date cannot be earlier than today.',
        }),
    endDate: Joi
        .date()
        .iso()
        .min(Joi.ref('checkinDate'))
        .optional()
        .messages({
            'date.base': 'End date must be a valid date.',
            'date.min': 'End date cannot be earlier than today.',
        }),
})
module.exports.adminUpdateBookingSchema = Joi.object({
    status : Joi
    .string()
    .valid(  "PENDING","CONFIRMED","CANCELED","FAILED","REFUND")
    .required()
    .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of "PENDING","CONFIRMED","CANCELED","FAILED" or "REFUND"',
            'any.required': 'Status is required'
    })
})



