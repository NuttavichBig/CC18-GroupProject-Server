const Joi = require("joi")

// Hotel path
module.exports.getHotelQuerySchema = Joi.object({
    search: Joi
        .string()
        .optional()
        .allow('')
        .messages({
            'string.base': 'Search term must be a string'
        }),
    maxPrice: Joi
        .number()
        .precision(2)
        .optional()
        .greater(Joi.ref('minPrice'))
        .messages({
            'number.base': 'Max price must be a number',
            'number.greater': '"maxPrice" must be greater than "minPrice"',
        }),
    minPrice: Joi
        .number()
        .precision(2)
        .default(0)
        .messages({
            'number.base': 'Min price must be a number'
        }),
    star: Joi
        .number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.base': 'Star rating must be a number',
            'number.integer': 'Star rating must be an integer',
            'number.min': 'Star rating must be at least 1',
            'number.max': 'Star rating must be at most 5'
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
        .valid('rating', 'price' , 'id')
        .default('id')
        .messages({
            'any.only': 'Sort by must be one of "rating", "price" or "id"',
            'string.base': 'Sort by must be a string'
        }),
    facilities: Joi
        .array()
        .items(Joi.string())
        .optional()
        .messages({
            'array.base': 'Facilities must be an array',
            'array.includes': 'Facilities must contain only strings'
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
    isActive: Joi
        .alternatives()
        .try(
            Joi.boolean(), // Allows boolean true or false directly
            Joi.string().valid('true', 'false').custom((value) => value === 'true') // Converts string to boolean
        )
        .messages({
            'any.only': 'IsActive must be "true" or "false".',
            'string.base': 'IsActive must be a string.',
        })
})
// .and('maxPrice', 'minPrice'); // Sure that ,maxPrice amd minPrice are provided together

module.exports.createHotelSchema = Joi.object({
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
    address: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Address must be a string',
            'any.required': 'Address is required'
        }),

    lat: Joi
        .number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.base': 'Latitude must be a number',
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
            'any.required': 'Latitude is required'
        }),

    lng: Joi
        .number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.base': 'Longitude must be a number',
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
            'any.required': 'Longitude is required'
        }),

    star: Joi
        .number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.base': 'Star rating must be a number',
            'number.integer': 'Star rating must be an integer',
            'number.min': 'Star rating must be at least 1',
            'number.max': 'Star rating must be at most 5',
            'any.required': 'Star rating is required'
        }),

    checkinTime: Joi
        .string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Check-in time must be a string',
            'string.pattern.base': 'Check-in time must be in "HH:MM" format',
            'any.required': 'Check-in time is required'
        }),

    checkoutTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Check-out time must be a string',
            'string.pattern.base': 'Check-out time must be in "HH:MM" format',
            'any.required': 'Check-out time is required'
        }),

    facilitiesHotel: Joi
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
        }),
        phone: Joi
        .string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be exactly 10 digits.',
            'any.required': 'Phone number are required'
        }),
        webPage : Joi
        .string()
        .optional()
        .messages({
            'string.pattern.base': 'Web page must be exactly 10 digits.'
        })
});

module.exports.updateHotelSchema = Joi.object({
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
    address: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Address must be a string',
            'any.required': 'Address is required'
        }),

    lat: Joi
        .number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.base': 'Latitude must be a number',
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
            'any.required': 'Latitude is required'
        }),

    lng: Joi
        .number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.base': 'Longitude must be a number',
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
            'any.required': 'Longitude is required'
        }),

    star: Joi
        .number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.base': 'Star rating must be a number',
            'number.integer': 'Star rating must be an integer',
            'number.min': 'Star rating must be at least 1',
            'number.max': 'Star rating must be at most 5',
            'any.required': 'Star rating is required'
        }),

    checkinTime: Joi
        .string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Check-in time must be a string',
            'string.pattern.base': 'Check-in time must be in "HH:MM" format',
            'any.required': 'Check-in time is required'
        }),

    checkoutTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Check-out time must be a string',
            'string.pattern.base': 'Check-out time must be in "HH:MM" format',
            'any.required': 'Check-out time is required'
        }),

    facilitiesHotel: Joi
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
        }),
        phone: Joi
        .string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be exactly 10 digits.'
        }),
        webPage : Joi
        .string()
        .optional()
        .messages({
            'string.pattern.base': 'Web page must be exactly 10 digits.'
        }),
        img: Joi
        .string()
        .optional()
        .messages({
            'string.base': 'Image must be a string'
        })
});