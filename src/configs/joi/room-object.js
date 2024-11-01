const Joi = require("joi")


// Room path
module.exports.createRoomSchema = Joi.object({
    name: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'any.required': 'Name is required'
        }),
    detail: Joi
        .string()
        .required()
        .allow('')
        .messages({
            'string.base': 'Detail must be a string'
        }),
    bedType: Joi
        .string()
        .valid('SUITE', 'DOUBLE', 'MASTER')
        .required()
        .messages({
            'any.only': 'Order by must be either "asc" or "desc"',
            'string.base': 'Order by must be a string'
        }),
    price: Joi
        .number()
        .precision(2)
        .positive()
        .required()
        .messages({
            'number.base': 'Price must be a number',
            'number.positive': 'Price must be greater than zero',
            'any.required': 'Price is required'
        }),
    recommendPeople: Joi
        .number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Recommended people must be a number',
            'number.integer': 'Recommended people must be an integer',
            'number.positive': 'Recommended people must be greater than zero',
            'any.required': 'Recommended people is required'
        }),
    size: Joi
        .number()
        .positive()
        .optional()
        .messages({
            'number.base': 'Size must be a number',
            'number.positive': 'Size must be greater than zero'
        }),
    roomAmount: Joi
        .number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Room amount must be a number',
            'number.integer': 'Room amount must be an integer',
            'number.positive': 'Room amount must be greater than zero',
            'any.required': 'Room amount is required'
        }),
    facilityRoom: Joi
        .object()
        .pattern(
            Joi.string(), // Keys must be strings
            Joi.alternatives()
                .try(
                    Joi.boolean(), // Allow boolean values
                    Joi.string().valid('true', 'false').custom((value) => {
                        // Convert string "true" to true and "false" to false
                        return value === 'true' ? true : false;
                    })
                )
        )
        .required()
        .messages({
            'object.base': 'Facilities must be an object with boolean values',
            'any.required': 'Facilities are required'
        })
});