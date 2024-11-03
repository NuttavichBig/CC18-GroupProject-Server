const Joi = require("joi")


// promotion
module.exports.getPromotionQuerySchema = Joi.object({
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
        .valid('id', 'name', 'discountPercent', 'discountValue', 'minimumSpend', 'maxDiscount', 'createdAt', 'startDate', 'endDate',"usageLimit","createdAt","updatedAt")
        .default('id')
        .messages({
            'any.only': 'Sort by must be one of "id", "name", "discountPercent", "discountValue", "minimumSpend", "maxDiscount", "createdAt", "startDate", "endDate","usageLimit","createdAt" or "updatedAt"',
            'string.base': 'Sort by must be a string'
        }),
    isActive: Joi
        .alternatives()
        .try(
            Joi.boolean(), // Allows boolean true or false directly
            Joi.string().valid('true', 'false').custom((value) => value === 'true'?true:false) // Converts string to boolean
        )
        .optional()
        .messages({
            'any.only': 'IsActive must be "true" or "false".',
            'string.base': 'IsActive must be a string.',
        })
})
module.exports.userGetPromotion = Joi.object({
    promotionId: Joi
    .number()
    .integer()
    .required()
    .messages({
        'number.base': "promotionId must be a number",
        'number.integer': "promotionId must be an integer",
        'any.required': 'promotionId amount is required'
    }),
})