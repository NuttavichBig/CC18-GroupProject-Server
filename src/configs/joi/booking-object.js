const Joi = require("joi")


// booking path
module.exports.getBookingQuerySchema = Joi.object({
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
        .valid('id', 'checkinDate', 'checkoutDate', 'createdAt', 'status')
        .default('id')
        .messages({
            'any.only': 'Sort by must be one of "id", "checkinDate", "checkoutDate","createdAt" or "status"',
            'string.base': 'Sort by must be a string'
        }),
})
module.exports.createBookingSchema = Joi.object({
    userId: Joi
        .number()
        .integer()
        .required()
        .messages({
            'number.base': "userId must be a number",
            'number.integer': "userId must be an integer",
            'any.required': 'userId amount is required'
        }),
    promotionId: Joi
        .number()
        .integer()
        .required()
        .messages({
            'number.base': "promotionId must be a number",
            'number.integer': "promotionId must be an integer",
            'any.required': 'promotionId amount is required'
        }),
    totalPrice: Joi
        .number()
        .precision(2)
        .positive()
        .required()
        .messages({
            'number.base': 'Price must be a number',
            'number.positive': 'Price must be greater than zero',
            'any.required': 'Price is required'
        }),
    checkinDate: Joi
        .date()
        .iso()
        .min('now')
        .required()
        .messages({
            'date.base': 'Check-in date must be a valid date.',
            'date.min': 'Check-in date cannot be earlier than today.',
            'any.required': 'Check-in date is required.',
        }),
    checkoutDate: Joi
        .date()
        .iso()
        .min(Joi.ref('checkinDate'))
        .required()
        .messages({
            'date.base': 'Checkout date must be a valid date.',
            'date.min': 'Checkout date must be later than check-in date.',
            'any.required': 'Checkout date is required.',
        })
})