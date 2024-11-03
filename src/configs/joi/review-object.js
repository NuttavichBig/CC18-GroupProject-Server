const Joi = require("joi")


// review
module.exports.getReviewQuerySchema = Joi.object({
    limit: Joi
        .number()
        .integer()
        .min(1)
        .default(30)
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
})
module.exports.createReviewSchema = Joi.object({
    content: Joi
        .string()
        .optional()
        .messages({
            'string.base': 'Content must be a string',
        }),
    bookingId: Joi
        .number()
        .integer()
        .required()
        .messages({
            'number.base': "BookingId must be a number",
            'number.integer': "BookingId must be an integer",
            'any.required': 'BookingId amount is required'
        }),
    rating: Joi
        .number()
        .integer()
        .required()
        .messages({
            'number.base': "Rating must be a number",
            'number.integer': "Rating must be an integer",
            'any.required': 'Rating amount is required'

        }),
})
module.exports.updateReviewSchema = Joi.object({
    content: Joi
        .string()
        .optional()
        .messages({
            'string.base': 'Content must be a string',
        }),
    rating: Joi
        .number()
        .integer()
        .optional()
        .messages({
            'number.base': "Rating must be a number",
            'number.integer': "Rating must be an integer",
        }),
})